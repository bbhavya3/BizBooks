package com.bizbooks.controller;

import com.bizbooks.model.Invoice;
import com.bizbooks.model.InvoiceItem;
import com.bizbooks.repository.InvoiceItemRepository;
import com.bizbooks.repository.InvoiceRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/invoice-items")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceItemController {

    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoiceRepository invoiceRepository;

    public InvoiceItemController(
            InvoiceItemRepository invoiceItemRepository,
            InvoiceRepository invoiceRepository) {

        this.invoiceItemRepository = invoiceItemRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // CREATE INVOICE ITEM
    @PostMapping
    public InvoiceItem addInvoiceItem(@RequestBody InvoiceItem invoiceItem) {

        // Quantity and unit price are required
        if (invoiceItem.getQuantity() == null ||
                invoiceItem.getUnitPrice() == null) {

            throw new RuntimeException(
                    "Quantity and unit price are required"
            );
        }

        // Backend calculates:
        // amount = quantity × unit price
        BigDecimal amount = invoiceItem.getQuantity()
                .multiply(invoiceItem.getUnitPrice());

        invoiceItem.setAmount(amount);

        // Find related invoice
        Invoice invoice = invoiceRepository
                .findById(invoiceItem.getInvoice().getId())
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        // Calculate existing subtotal
        BigDecimal subtotal = invoiceItemRepository
                .findByInvoiceId(invoice.getId())
                .stream()
                .map(item -> item.getAmount() != null
                        ? item.getAmount()
                        : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Add current item amount
        subtotal = subtotal.add(amount);

        // Update invoice subtotal
        invoice.setSubtotal(subtotal);

        // Get tax
        BigDecimal tax = invoice.getTax() != null
                ? invoice.getTax()
                : BigDecimal.ZERO;

        // Update invoice total
        invoice.setTotal(subtotal.add(tax));

        // Save updated invoice
        invoiceRepository.save(invoice);

        // Save invoice item
        return invoiceItemRepository.save(invoiceItem);
    }

    // GET ALL INVOICE ITEMS
    @GetMapping
    public List<InvoiceItem> getAllInvoiceItems() {
        return invoiceItemRepository.findAll();
    }

    // GET ITEMS FOR A PARTICULAR INVOICE
    @GetMapping("/invoice/{invoiceId}")
    public List<InvoiceItem> getItemsByInvoiceId(
            @PathVariable Long invoiceId) {

        return invoiceItemRepository.findByInvoiceId(invoiceId);
    }

    // GET ONE INVOICE ITEM
    @GetMapping("/{id}")
    public InvoiceItem getInvoiceItemById(
            @PathVariable Long id) {

        return invoiceItemRepository
                .findById(id)
                .orElse(null);
    }
}