package com.bizbooks.repository;

import com.bizbooks.model.PaymentMock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentMockRepository
        extends JpaRepository<PaymentMock, Long> {

    List<PaymentMock> findByInvoiceId(Long invoiceId);
}