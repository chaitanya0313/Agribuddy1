package com.agribuddy.agribuddy_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Generates a secure 6-digit OTP
     */
    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // always 6 digits
        return String.valueOf(otp);
    }

    /**
     * Sends OTP to farmer's registered email
     * (We use email to deliver OTP since SMS needs paid gateway)
     */
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("AgriFinTech - Your Login OTP");
        message.setText(
            "Dear Farmer,\n\n" +
            "Your one-time password (OTP) for AgriFinTech login is:\n\n" +
            "  " + otp + "\n\n" +
            "This OTP is valid for 5 minutes. Do not share it with anyone.\n\n" +
            "- AgriFinTech Team"
        );
        mailSender.send(message);
    }
}