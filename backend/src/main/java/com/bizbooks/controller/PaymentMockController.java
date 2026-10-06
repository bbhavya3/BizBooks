package com.bizbooks.controller;

import com.bizbooks.model.Invoice;
import com.bizbooks.model.PaymentMock;
import com.bizbooks.repository.InvoiceRepository;
import com.bizbooks.repository.PaymentMockRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentMockController {

    private final PaymentMockRepository paymentMockRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentMockController(
            PaymentMockRepository paymentMockRepository,
            InvoiceRepository invoiceRepository) {

        this.paymentMockRepository = paymentMockRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // CREATE MOCK PAYMENT
    @PostMapping
    public PaymentMock createPayment(
            @RequestBody PaymentMock payment) {

        Invoice invoice = invoiceRepository
                .findById(payment.getInvoiceId())
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        // If payment date is not provided, use today's date
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }

        // Mark payment as completed
        payment.setStatus("COMPLETED");

        // Save payment
        PaymentMock savedPayment =
                paymentMockRepository.save(payment);

        // Mark invoice as PAID
        invoice.setStatus(
                com.bizbooks.model.InvoiceStatus.PAID
        );

        invoiceRepository.save(invoice);

        return savedPayment;
    }

    // GET ALL PAYMENTS
    @GetMapping
    public List<PaymentMock> getAllPayments() {
        return paymentMockRepository.findAll();
    }

    // GET PAYMENTS FOR ONE INVOICE
    @GetMapping("/invoice/{invoiceId}")
    public List<PaymentMock> getPaymentsByInvoice(
            @PathVariable Long invoiceId) {

        return paymentMockRepository
                .findByInvoiceId(invoiceId);
    }
}