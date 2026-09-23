package com.resumeportfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendContactMessage(String toEmail, String portfolioOwnerName,
                                   String senderName, String senderEmail, String messageBody) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(fromAddress);
        mail.setTo(toEmail);
        mail.setReplyTo(senderEmail);
        mail.setSubject("New portfolio contact message from " + senderName);
        mail.setText(
                "You received a new message via " + portfolioOwnerName + "'s portfolio contact form.\n\n" +
                        "From: " + senderName + " <" + senderEmail + ">\n\n" +
                        "Message:\n" + messageBody + "\n\n" +
                        "— Reply directly to this email to respond to " + senderName + "."
        );
        mailSender.send(mail);
    }
}