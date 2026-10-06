package com.bizbooks.controller;

import com.bizbooks.service.CurrencyService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/currency")
@CrossOrigin(origins = "http://localhost:5173")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/rate")
    public Map<String, Object> getCurrencyRate(
            @RequestParam String from,
            @RequestParam String to) {

        return currencyService.getExchangeRate(from, to);
    }
}