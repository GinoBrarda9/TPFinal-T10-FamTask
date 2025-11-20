package com.team10.famtask;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;


@EnableScheduling
@SpringBootApplication(scanBasePackages = "com.team10.famtask")
public class FamtaskApplication {

	public static void main(String[] args) {
		SpringApplication.run(FamtaskApplication.class, args);
	}
}
