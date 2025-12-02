package com.team10.famtask.reports.finance;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.finance.entity.Movement;
import com.team10.famtask.finance.entity.MovementType;
import com.team10.famtask.finance.repository.MovementRepository;
import com.team10.famtask.reports.finance.dto.FinanceReportDTO;
import com.team10.famtask.reports.finance.dto.MonthlyBalanceDTO;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceReportService {

    private final MovementRepository movementRepository;
    private final FamilyRepository familyRepository;
    private final SecurityService securityService;

    // -------------------------------------------------------------------------
    // Obtener familia del usuario logueado
    // -------------------------------------------------------------------------
    private Family getLoggedFamily() {
        String dni = securityService.getCurrentUser().getDni();

        return familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new RuntimeException("No pertenecés a ninguna familia"));
    }

    // -------------------------------------------------------------------------
    // Reporte completo con FROM / TO
    // -------------------------------------------------------------------------
    public FinanceReportDTO generateFinanceReport(LocalDate from, LocalDate to) {

        Family family = getLoggedFamily();

        // Default values
        if (from == null) from = LocalDate.now().withDayOfYear(1);
        if (to == null) to = LocalDate.now();

        if (from.isAfter(to)) {
            throw new IllegalArgumentException("La fecha 'from' no puede ser mayor que 'to'.");
        }

        // 1) Obtener movimientos y filtrar por rango
        LocalDate finalFrom = from;
        LocalDate finalTo = to;
        List<Movement> movements = movementRepository.findByFamily(family).stream()
                .filter(m -> m.getCreatedAt() != null)
                .filter(m -> {
                    LocalDate date = m.getCreatedAt().toLocalDate();
                    return (date.isEqual(finalFrom) || date.isAfter(finalFrom)) &&
                            (date.isEqual(finalTo) || date.isBefore(finalTo));
                })
                .toList();

        // 2) Totales
        double totalIncome = movements.stream()
                .filter(m -> m.getType() == MovementType.INCOME)
                .mapToDouble(Movement::getAmount)
                .sum();

        double totalExpenses = movements.stream()
                .filter(m -> m.getType() == MovementType.EXPENSE)
                .mapToDouble(Movement::getAmount)
                .sum();

        // 3) Categorías
        Map<String, Double> expensesByCategory = movements.stream()
                .filter(m -> m.getType() == MovementType.EXPENSE)
                .collect(Collectors.groupingBy(
                        m -> m.getCategory().name(),
                        Collectors.summingDouble(Movement::getAmount)
                ));

        // 4) Gastos por miembro
        Map<String, Double> expensesByMember = calculateMemberExpenses(family, movements);

        // 5) Tendencia mensual
        List<MonthlyBalanceDTO> monthlyTrend = calculateMonthlyTrend(from, to, movements);

        // 6) Construcción del DTO final
        return new FinanceReportDTO(
                totalIncome,
                totalExpenses,
                totalIncome - totalExpenses,
                monthlyTrend,
                expensesByCategory,
                expensesByMember
        );
    }

    // -------------------------------------------------------------------------
// Gastos por miembro (versión FINAL usando createdBy real)
// -------------------------------------------------------------------------
    private Map<String, Double> calculateMemberExpenses(Family family, List<Movement> movements) {

        Map<String, Double> result = new HashMap<>();

        for (Movement m : movements) {

            if (m.getType() == MovementType.EXPENSE) {

                String name;

                if (m.getCreatedBy() != null && m.getCreatedBy().getName() != null) {
                    name = m.getCreatedBy().getName();   // nombre real del autor del gasto
                } else {
                    name = "Desconocido";                // fallback
                }

                result.put(name, result.getOrDefault(name, 0.0) + m.getAmount());
            }
        }

        return result;
    }


    // -------------------------------------------------------------------------
    // Tendencia mensual basada en rango desde/hasta
    // -------------------------------------------------------------------------
    private List<MonthlyBalanceDTO> calculateMonthlyTrend(LocalDate from, LocalDate to, List<Movement> movements) {

        List<MonthlyBalanceDTO> list = new ArrayList<>();

        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);

        YearMonth current = start;

        while (!current.isAfter(end)) {

            int year = current.getYear();
            int month = current.getMonthValue();

            List<Movement> monthly = movements.stream()
                    .filter(m -> m.getCreatedAt().getYear() == year &&
                            m.getCreatedAt().getMonthValue() == month)
                    .toList();

            double income = monthly.stream()
                    .filter(m -> m.getType() == MovementType.INCOME)
                    .mapToDouble(Movement::getAmount)
                    .sum();

            double expenses = monthly.stream()
                    .filter(m -> m.getType() == MovementType.EXPENSE)
                    .mapToDouble(Movement::getAmount)
                    .sum();

            list.add(new MonthlyBalanceDTO(
                    current.getMonth().getDisplayName(TextStyle.FULL, new Locale("es")),
                    income,
                    expenses,
                    income - expenses
            ));

            current = current.plusMonths(1);
        }

        return list;
    }
}
