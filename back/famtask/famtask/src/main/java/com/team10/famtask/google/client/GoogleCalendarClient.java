package com.team10.famtask.google.client;

import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

@Slf4j
@Component
public class GoogleCalendarClient {

    private static final String APPLICATION_NAME = "FamTask App";
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static Calendar calendarService;

    private static Calendar getCalendarService() throws Exception {

        if (calendarService != null) return calendarService;

        InputStream in = GoogleCalendarClient.class.getResourceAsStream("/credentials.json");

        if (in == null) {
            throw new RuntimeException("❌ No se encontró credentials.json en resources");
        }

        GoogleClientSecrets secrets =
                GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

        var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow
                .Builder(
                httpTransport,
                JSON_FACTORY,
                secrets,
                List.of(CalendarScopes.CALENDAR, CalendarScopes.CALENDAR_EVENTS)
        )
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();

        var credential = new AuthorizationCodeInstalledApp(
                flow,
                new LocalServerReceiver.Builder().setPort(8888).build()
        ).authorize("user");

        calendarService = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();

        return calendarService;
    }

    public Calendar service() {
        try {
            return getCalendarService();
        } catch (Exception e) {
            throw new RuntimeException("❌ Error inicializando Google Calendar client", e);
        }
    }
}
