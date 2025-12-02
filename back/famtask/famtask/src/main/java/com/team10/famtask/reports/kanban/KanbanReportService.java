package com.team10.famtask.reports.kanban;

import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.CardStatus;
import com.team10.famtask.board.repository.BoardRepository;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.reports.kanban.dto.ColumnSummaryDTO;
import com.team10.famtask.reports.kanban.dto.KanbanReportDTO;
import com.team10.famtask.reports.kanban.dto.MemberSummaryDTO;
import com.team10.famtask.reports.kanban.dto.MonthlyKanbanTrendDTO;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class KanbanReportService {

    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final FamilyRepository familyRepository;
    private final SecurityService securityService;

    private Family getLoggedFamily() {
        String dni = securityService.getCurrentUser().getDni();
        return familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new RuntimeException("No pertenecés a ninguna familia"));
    }

    // ===================================================================
    // GENERATE REPORT
    // ===================================================================
    public KanbanReportDTO generateKanbanReport(LocalDate from, LocalDate to) {

        Family family = getLoggedFamily();

        Board board = boardRepository.findByFamilyId(family.getId())
                .orElseThrow(() -> new RuntimeException("La familia no tiene tablero"));

        if (from == null) from = LocalDate.now().withDayOfYear(1);
        if (to == null) to = LocalDate.now();

        if (from.isAfter(to)) throw new IllegalArgumentException("from no puede ser mayor a to");

        // ------------------------------------------------------------
        // 1) Cargar todas las cards del board
        // ------------------------------------------------------------
        List<Card> allCards = board.getColumns().stream()
                .flatMap(c -> cardRepository.findByColumnOrderByPosition(c).stream())
                .toList();

        // ------------------------------------------------------------
        // 2) Filtrar cards por createdAt (modelo Opción A)
        // ------------------------------------------------------------
        LocalDate finalFrom = from;
        LocalDate finalTo = to;
        List<Card> filtered = allCards.stream()
                .filter(card -> card.getCreatedAt() != null)
                .filter(card ->
                        !card.getCreatedAt().toLocalDate().isBefore(finalFrom) &&
                                !card.getCreatedAt().toLocalDate().isAfter(finalTo)
                )
                .toList();

        // ------------------------------------------------------------
        // 3) Totales globales
        // ------------------------------------------------------------
        long total = filtered.size();
        long finished = filtered.stream().filter(c -> Boolean.TRUE.equals(c.getFinished())).count();
        long pending = filtered.stream().filter(c -> !Boolean.TRUE.equals(c.getFinished())).count();
        long overdue = filtered.stream().filter(c -> c.getStatus() == CardStatus.OVERDUE).count();
        long nearDue = filtered.stream().filter(c -> c.getStatus() == CardStatus.NEAR_DUE).count();
        long unassigned = filtered.stream().filter(c -> c.getAssignedUser() == null).count();

        // ------------------------------------------------------------
        // 4) Column Summary
        // ------------------------------------------------------------
        List<ColumnSummaryDTO> columns = board.getColumns().stream()
                .map(col -> {

                    List<Card> colCards = filtered.stream()
                            .filter(c -> c.getColumn().getId().equals(col.getId()))
                            .toList();

                    return new ColumnSummaryDTO(
                            col.getId(),
                            col.getName(),
                            colCards.size(),
                            colCards.stream().filter(c -> Boolean.TRUE.equals(c.getFinished())).count(),
                            colCards.stream().filter(c -> c.getStatus() == CardStatus.PENDING).count(),
                            colCards.stream().filter(c -> c.getStatus() == CardStatus.NEAR_DUE).count(),
                            colCards.stream().filter(c -> c.getStatus() == CardStatus.OVERDUE).count()
                    );
                })
                .toList();

        // ------------------------------------------------------------
        // 5) Member Summary
        // ------------------------------------------------------------
        Map<String, List<Card>> cardsByUser = filtered.stream()
                .filter(c -> c.getAssignedUser() != null)
                .collect(Collectors.groupingBy(c -> c.getAssignedUser().getDni()));

        List<MemberSummaryDTO> memberSummaries = cardsByUser.entrySet().stream()
                .map(entry -> {

                    String dni = entry.getKey();
                    List<Card> cards = entry.getValue();

                    String name = cards.get(0).getAssignedUser().getName();

                    long totalAssigned = cards.size();
                    long done = cards.stream().filter(c -> Boolean.TRUE.equals(c.getFinished())).count();
                    long ov = cards.stream().filter(c -> c.getStatus() == CardStatus.OVERDUE).count();
                    long pend = cards.stream().filter(c -> !Boolean.TRUE.equals(c.getFinished())).count();

                    return new MemberSummaryDTO(
                            dni,
                            name,
                            totalAssigned,
                            done,
                            ov,
                            pend
                    );
                })
                .toList();

        // ------------------------------------------------------------
        // 6) Monthly Trend (createdAt)
        // ------------------------------------------------------------
        List<MonthlyKanbanTrendDTO> trend = calculateTrend(from, to, filtered);

        // ------------------------------------------------------------
        // 7) Construcción DTO final
        // ------------------------------------------------------------
        return new KanbanReportDTO(
                board.getId(),
                board.getName(),
                total,
                finished,
                pending,
                overdue,
                nearDue,
                unassigned,
                columns,
                memberSummaries,
                trend
        );
    }

    // ===================================================================
    // MONTHLY TREND (createdAt)
    // ===================================================================
    private List<MonthlyKanbanTrendDTO> calculateTrend(LocalDate from, LocalDate to, List<Card> cards) {

        List<MonthlyKanbanTrendDTO> list = new ArrayList<>();

        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);
        YearMonth current = start;

        while (!current.isAfter(end)) {

            int y = current.getYear();
            int m = current.getMonthValue();

            List<Card> monthlyCreated = cards.stream()
                    .filter(c -> c.getCreatedAt().getYear() == y &&
                            c.getCreatedAt().getMonthValue() == m)
                    .toList();

            long created = monthlyCreated.size();
            long completed = monthlyCreated.stream().filter(c -> Boolean.TRUE.equals(c.getFinished())).count();

            list.add(new MonthlyKanbanTrendDTO(
                    current.getMonth().getDisplayName(TextStyle.FULL, new Locale("es")),
                    created,
                    completed,
                    created - completed
            ));

            current = current.plusMonths(1);
        }

        return list;
    }
}
