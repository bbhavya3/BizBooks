package com.bizbooks.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class CurrencyService {

    private final RestClient restClient;

    public CurrencyService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.frankfurter.dev")
                .build();
    }

    public Map<String, Object> getExchangeRate(String from, String to) {

        return restClient.get()
                .uri("/v2/rate/{from}/{to}", from.toLowerCase(), to.toLowerCase())
                .retrieve()
                .body(Map.class);
    }
}