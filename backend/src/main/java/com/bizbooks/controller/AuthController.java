package com.bizbooks.controller;

import com.bizbooks.model.User;
import com.bizbooks.repository.UserRepository;
import com.bizbooks.service.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {

        Optional<User> existingUser =
                userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody User loginUser) {

        Optional<User> userOptional =
                userRepository.findByEmail(
                        loginUser.getEmail()
                );

        if (userOptional.isEmpty()) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        User user = userOptional.get();

        /*
         * Existing users may still have old plain-text
         * passwords. Support them once and automatically
         * convert them to BCrypt.
         */
        boolean passwordMatches;

        if (user.getPassword().startsWith("$2")) {

            passwordMatches =
                    passwordEncoder.matches(
                            loginUser.getPassword(),
                            user.getPassword()
                    );

        } else {

            passwordMatches =
                    user.getPassword().equals(
                            loginUser.getPassword()
                    );

            if (passwordMatches) {

                user.setPassword(
                        passwordEncoder.encode(
                                loginUser.getPassword()
                        )
                );

                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // Generate JWT token
        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    // Login response
    public static class LoginResponse {

        private String token;
        private Long id;
        private String name;
        private String email;
        private String role;

        public LoginResponse(
                String token,
                Long id,
                String name,
                String email,
                String role) {

            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public String getToken() {
            return token;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }
    }
}