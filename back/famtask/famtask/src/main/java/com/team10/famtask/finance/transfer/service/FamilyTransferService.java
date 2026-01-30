package com.team10.famtask.finance.transfer.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.resources.preference.Preference;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.finance.entity.Movement;
import com.team10.famtask.finance.entity.MovementType;
import com.team10.famtask.finance.repository.MovementRepository;
import com.team10.famtask.finance.transfer.dto.TransferCreateRequestDTO;
import com.team10.famtask.finance.transfer.dto.TransferResponseDTO;
import com.team10.famtask.finance.transfer.entity.FamilyTransfer;
import com.team10.famtask.finance.transfer.entity.TransferStatus;
import com.team10.famtask.finance.transfer.repository.FamilyTransferRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.service.security.SecurityService;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FamilyTransferService {

    private final FamilyTransferRepository transferRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final MovementRepository movementRepository;
    private final SecurityService securityService;
    private final Dotenv dotenv;

    private Family getLoggedUserFamily() {
        String dni = securityService.getCurrentUser().getDni();
        return familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No pertenecés a ninguna familia"
                ));
    }

    public List<TransferResponseDTO> listMyFamilyTransfers() {
        Family family = getLoggedUserFamily();
        return transferRepository.findByFamilyOrderByCreatedAtDesc(family)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Demo A: Crea una transferencia PENDING y genera un link de pago (Checkout Pro).
     */
    public TransferResponseDTO createTransfer(TransferCreateRequestDTO dto) {
        Family family = getLoggedUserFamily();
        User from = securityService.getCurrentUser();

        // Validar que el destinatario pertenezca a la misma familia
        String toDni = dto.getToUserDni();
        boolean isMember = familyMemberRepository.existsById_UserDniAndId_FamilyId(toDni, family.getId());
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El destinatario no pertenece a tu familia");
        }

        User to = userRepository.findByDni(toDni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario destino no encontrado"));

        // Generar preferencia MP
        String accessToken = dotenv.get("MERCADOPAGO_ACCESS_TOKEN");

        String extRef = "transfer_" + UUID.randomUUID();
        String successUrl = defaultIfBlank(dotenv.get("MERCADOPAGO_SUCCESS_URL"), "http://localhost:5173/finance?mp=success");
        String failureUrl = defaultIfBlank(dotenv.get("MERCADOPAGO_FAILURE_URL"), "http://localhost:5173/finance?mp=failure");
        String pendingUrl = defaultIfBlank(dotenv.get("MERCADOPAGO_PENDING_URL"), "http://localhost:5173/finance?mp=pending");

        // Si aún no hay token, igual dejamos creada la transferencia (demo A),
        // pero sin link de Mercado Pago.
        if (accessToken == null || accessToken.isBlank()) {
            FamilyTransfer transfer = FamilyTransfer.builder()
                    .amount(dto.getAmount())
                    .description(dto.getDescription())
                    .category(dto.getCategory())
                    .status(TransferStatus.PENDING)
                    .mpExternalReference(extRef)
                    .createdAt(LocalDateTime.now())
                    .family(family)
                    .fromUser(from)
                    .toUser(to)
                    .build();
            return toDTO(transferRepository.save(transfer));
        }

        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PreferenceClient client = new PreferenceClient();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Transferencia familiar")
                    .description(dto.getDescription())
                    .quantity(1)
                    .unitPrice(BigDecimal.valueOf(dto.getAmount().floatValue()))
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(successUrl)
                    .failure(failureUrl)
                    .pending(pendingUrl)
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .externalReference(extRef)
                    .build();

            Preference preference = client.create(request);

            FamilyTransfer transfer = FamilyTransfer.builder()
                    .amount(dto.getAmount())
                    .description(dto.getDescription())
                    .category(dto.getCategory())
                    .status(TransferStatus.PENDING)
                    .mpPreferenceId(preference.getId())
                    .mpInitPoint(preference.getInitPoint())
                    .mpExternalReference(extRef)
                    .createdAt(LocalDateTime.now())
                    .family(family)
                    .fromUser(from)
                    .toUser(to)
                    .build();

            return toDTO(transferRepository.save(transfer));

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No se pudo crear la preferencia de Mercado Pago: " + e.getMessage());
        }
    }

    /**
     * Demo A: marcar como pagada y crear movimientos.
     */
    public TransferResponseDTO markPaid(Long transferId) {
        Family family = getLoggedUserFamily();
        FamilyTransfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transferencia no encontrada"));

        if (!transfer.getFamily().getId().equals(family.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tenés permiso sobre esta transferencia");
        }

        if (transfer.getStatus() == TransferStatus.COMPLETED) {
            return toDTO(transfer);
        }

        transfer.setStatus(TransferStatus.COMPLETED);
        transferRepository.save(transfer);

        // Crear movimientos (2) para que impacte en reportes/balance
        Movement expense = Movement.builder()
                .amount(transfer.getAmount())
                .description("Pago a " + transfer.getFromUser().getName() + ": " + transfer.getDescription())
                .category(transfer.getCategory())
                .type(MovementType.EXPENSE)
                .createdAt(LocalDateTime.now())
                .family(family)
                .build();
        expense.setCreatedBy(transfer.getToUser());

        Movement income = Movement.builder()
                .amount(transfer.getAmount())
                .description("Cobro de " + transfer.getToUser().getName() + ": " + transfer.getDescription())
                .category(transfer.getCategory())
                .type(MovementType.INCOME)
                .createdAt(LocalDateTime.now())
                .family(family)
                .build();
        income.setCreatedBy(transfer.getFromUser());

        movementRepository.save(expense);
        movementRepository.save(income);

        return toDTO(transfer);
    }

    private TransferResponseDTO toDTO(FamilyTransfer t) {
        return TransferResponseDTO.builder()
                .id(t.getId())
                .amount(t.getAmount())
                .description(t.getDescription())
                .category(t.getCategory())
                .status(t.getStatus())
                .mpInitPoint(t.getMpInitPoint())
                .createdAt(t.getCreatedAt())
                .fromUserDni(t.getFromUser() != null ? t.getFromUser().getDni() : null)
                .toUserDni(t.getToUser() != null ? t.getToUser().getDni() : null)
                .build();
    }

    private String defaultIfBlank(String val, String fallback) {
        return (val == null || val.isBlank()) ? fallback : val;
    }
}
