package com.bizbooks.controller;

import com.bizbooks.model.Customer;
import com.bizbooks.model.Invoice;
import com.bizbooks.model.User;
import com.bizbooks.repository.CustomerRepository;
import com.bizbooks.repository.InvoiceItemRepository;
import com.bizbooks.repository.InvoiceRepository;
import com.bizbooks.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public InvoiceController(
            InvoiceRepository invoiceRepository,
            InvoiceItemRepository invoiceItemRepository,
            CustomerRepository customerRepository,
            UserRepository userRepository) {

        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    // CREATE INVOICE
    @PostMapping
    public Invoice addInvoice(@RequestBody Invoice invoice) {

        invoice.setSubtotal(BigDecimal.ZERO);

        invoice.setTotal(
                invoice.getTax() != null
                        ? invoice.getTax()
                        : BigDecimal.ZERO
        );

        return invoiceRepository.save(invoice);
    }

    // GET INVOICES
    @GetMapping
    public List<Invoice> getInvoices(Authentication authentication) {

        String role = authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("");

        // CUSTOMER → only their own invoices
        if (role.equals("ROLE_CUSTOMER")) {

            User user = userRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.UNAUTHORIZED,
                                    "User not found"
                            )
                    );

            Customer customer = customerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Customer profile not found"
                            )
                    );

            List<Invoice> invoices =
                    invoiceRepository.findByCustomerId(customer.getId());

            updateOverdueInvoices(invoices);

            return invoices;
        }

        // OWNER / ACCOUNTANT → all invoices
        List<Invoice> invoices = invoiceRepository.findAll();

        updateOverdueInvoices(invoices);

        return invoices;
    }

    // GET ONE INVOICE
    @GetMapping("/{id}")
    public Invoice getInvoiceById(
            @PathVariable Long id,
            Authentication authentication) {

        Invoice invoice = invoiceRepository
                .findById(id)
                .orElse(null);

        if (invoice == null) {
            return null;
        }

        String role = authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("");

        // CUSTOMER can access only their own invoice
        if (role.equals("ROLE_CUSTOMER")) {

            User user = userRepository
                    .findByEmail(authentication.getName())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.UNAUTHORIZED,
                                    "User not found"
                            )
                    );

            Customer customer = customerRepository
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Customer profile not found"
                            )
                    );

            if (invoice.getCustomer() == null
                    || !invoice.getCustomer().getId()
                    .equals(customer.getId())) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this invoice"
                );
            }
        }

        updateOverdueInvoice(invoice);

        return invoice;
    }

    // UPDATE INVOICE
    @PutMapping("/{id}")
    public Invoice updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice invoice) {

        Invoice existingInvoice =
                invoiceRepository.findById(id).orElse(null);

        if (existingInvoice == null) {
            return null;
        }

        existingInvoice.setInvoiceNumber(
                invoice.getInvoiceNumber()
        );

        existingInvoice.setCustomer(
                invoice.getCustomer()
        );

        existingInvoice.setIssueDate(
                invoice.getIssueDate()
        );

        existingInvoice.setDueDate(
                invoice.getDueDate()
        );

        existingInvoice.setStatus(
                invoice.getStatus()
        );

        existingInvoice.setCurrency(
                invoice.getCurrency()
        );

        existingInvoice.setSubtotal(
                invoice.getSubtotal()
        );

        existingInvoice.setTax(
                invoice.getTax()
        );

        // Backend calculates total
        BigDecimal subtotal =
                invoice.getSubtotal() != null
                        ? invoice.getSubtotal()
                        : BigDecimal.ZERO;

        BigDecimal tax =
                invoice.getTax() != null
                        ? invoice.getTax()
                        : BigDecimal.ZERO;

        existingInvoice.setTotal(
                subtotal.add(tax)
        );

        return invoiceRepository.save(existingInvoice);
    }

    // Automatically mark overdue invoices
    private void updateOverdueInvoices(List<Invoice> invoices) {

        for (Invoice invoice : invoices) {
            updateOverdueInvoice(invoice);
        }
    }

    private void updateOverdueInvoice(Invoice invoice) {

        if (invoice.getDueDate() != null
                && invoice.getDueDate().isBefore(LocalDate.now())
                && invoice.getStatus()
                == com.bizbooks.model.InvoiceStatus.ISSUED) {

            invoice.setStatus(
                    com.bizbooks.model.InvoiceStatus.OVERDUE
            );

            invoiceRepository.save(invoice);
        }
    }
}