package com.bizbooks.config;

import com.bizbooks.security.JwtAuthenticationFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // CORS preflight
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Login / Register
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()


                // =========================
                // CUSTOMER
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/customers"
                ).hasRole("OWNER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/customers/**"
                ).hasRole("OWNER")

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/customers/**"
                ).hasRole("OWNER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/customers/**"
                ).authenticated()


                // =========================
                // INVOICES
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/invoices"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/invoices/**"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/invoices/**"
                ).authenticated()


                // =========================
                // INVOICE ITEMS
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/invoice-items"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/invoice-items/**"
                ).authenticated()


                // =========================
                // EXPENSES
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/expenses"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/expenses/**"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/expenses/**"
                ).hasAnyRole("OWNER", "ACCOUNTANT")


                // =========================
                // CURRENCY
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/currency/**"
                ).hasAnyRole("OWNER", "ACCOUNTANT")


                // =========================
                // PAYMENTS
                // =========================

                // Only OWNER + ACCOUNTANT can record payments
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payments"
                ).hasAnyRole("OWNER", "ACCOUNTANT")

                // Only OWNER + ACCOUNTANT can view payments
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/payments/**"
                ).hasAnyRole("OWNER", "ACCOUNTANT")


                // Everything else requires login
                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173", "https://bizbook3.netlify.app")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type"
            )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
