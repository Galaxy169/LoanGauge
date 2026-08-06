package com.loangauge.financialservice.repository;

import com.loangauge.financialservice.entity.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {

    List<LoanType> findByIsActiveTrue();
}