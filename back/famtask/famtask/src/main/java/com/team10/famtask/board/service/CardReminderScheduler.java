package com.team10.famtask.board.service;

import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.CardStatus;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.whatsapp.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardReminderScheduler {

    private final CardRepository cardRepository;
    private final WhatsAppService whatsappService;

    @Scheduled(cron = "0 */5 * * * *", zone = "America/Argentina/Cordoba")
    @Transactional
    public void checkCardDeadlines() {

        ZoneId zone = ZoneId.of("America/Argentina/Cordoba");
        LocalDateTime now = LocalDateTime.now(zone);

        List<Card> cards = cardRepository.findAll().stream()
                .filter(c -> c.getDueDate() != null)
                .filter(c -> !Boolean.TRUE.equals(c.getFinished()))
                .filter(c -> c.getAssignedUser() != null)
                .toList();

        for (Card card : cards) {

            LocalDateTime due = card.getDueDate();
            String phone = normalizePhone(card.getAssignedUser().getPhone());
            if (phone == null) continue;

            long minutesLeft = Duration.between(now, due).toMinutes();

            // -------------------------------
            // 🟦 24 horas antes
            // -------------------------------
            if (!Boolean.TRUE.equals(card.getReminderDayBeforeSent())
                    && minutesLeft <= 1440 && minutesLeft > 60) {

                sendReminder(card, phone, "DAY_BEFORE");
                card.setReminderDayBeforeSent(true);
                card.setStatus(CardStatus.NEAR_DUE);
            }

            // -------------------------------
            // 🟩 1 hora antes
            // -------------------------------
            if (!Boolean.TRUE.equals(card.getReminderHourBeforeSent())
                    && minutesLeft <= 60 && minutesLeft > 0) {

                sendReminder(card, phone, "HOUR_BEFORE");
                card.setReminderHourBeforeSent(true);
                card.setStatus(CardStatus.NEAR_DUE);
            }

            // -------------------------------
            // 🔴 Vencida
            // -------------------------------
            if (!Boolean.TRUE.equals(card.getReminderExpiredSent())
                    && minutesLeft <= 0) {

                sendReminder(card, phone, "EXPIRED");
                card.setReminderExpiredSent(true);
                card.setStatus(CardStatus.OVERDUE);
            }

            cardRepository.save(card);
        }
    }

    private void sendReminder(Card card, String phone, String type) {
        try {
            whatsappService.sendCardReminder(phone, card.getTitle(), type);
            log.info("📨 Reminder '{}' enviado para card {} ({})",
                    type, card.getId(), card.getTitle());
        } catch (Exception e) {
            log.error("❌ Error enviando reminder para card {}: {}", card.getId(), e.getMessage());
        }
    }

    private String normalizePhone(String raw) {
        if (raw == null || raw.isBlank()) return null;

        String digits = raw.replaceAll("\\D", "");

        if (digits.length() == 10) {
            return "+54" + digits; // Ej: 351xxxxxxx
        }
        if (digits.startsWith("54")) {
            return "+" + digits;
        }
        if (!digits.startsWith("+")) {
            return "+" + digits;
        }
        return digits;
    }
}
