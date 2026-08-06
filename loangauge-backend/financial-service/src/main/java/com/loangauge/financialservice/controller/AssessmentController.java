package com.loangauge.financialservice.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.loangauge.financialservice.dto.ApiResponse;
import com.loangauge.financialservice.dto.AssessmentRequestDto;
import com.loangauge.financialservice.dto.AssessmentResponseDto;
import com.loangauge.financialservice.security.SecurityUtil;
import com.loangauge.financialservice.service.AssessmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
// It is used to group, describe our rest api endpoint swagger
@Tag(name = "Financial Assessment", description = "Run and retrieve financial readiness assessments")
public class AssessmentController {

	private final AssessmentService assessmentService;

	/*
	 * URL: /api/assessments
	 * Method: POST
	 * Body: {
	 * {
  			"loanTypeId"
  			"loanAmount"
  			"tenureMonths"
  			"interestRate"
}
	 * }
	 * 
	 */
	
	@PostMapping
	@Operation(summary = "Run a new financial readiness assessment") // Swagger Annonation used to describe
	public ResponseEntity<ApiResponse<AssessmentResponseDto>> createAssessment(
			@Valid @RequestBody AssessmentRequestDto request) {
		Long userId = SecurityUtil.getCurrentUserId();
		String role = SecurityUtil.getCurrentUserRole();
		String userEmail = SecurityUtil.getCurrentUserEmail();
		AssessmentResponseDto result = assessmentService.createAssessment(userId, role, userEmail, request);
		
	    return ResponseEntity
	            .status(HttpStatus.CREATED)
	            .body(ApiResponse.success(result, "Assessment completed successfully"));

	}
	
	/*
	 * URL: /api/assessments/{assessmentId}
	 * Method: GET
	 * 
	 */

	@GetMapping("/{assessmentId}")
	@Operation(summary = "Get a single assessment by ID (only the caller's own)")
	public ResponseEntity<ApiResponse<AssessmentResponseDto>> getAssessment(@PathVariable Long assessmentId){
		Long userId = SecurityUtil.getCurrentUserId();
		
		AssessmentResponseDto result = assessmentService.getAssessmentById(userId, assessmentId);
		return ResponseEntity.ok(ApiResponse.success(result));
		
	}
	
	/*
	 * URL: /api/assessments/history}
	 * Method: GET
	 * 
	 */

	@GetMapping("/history")
	@Operation(summary = "Get the caller's full assessment history, newest first")
	ResponseEntity<ApiResponse<List<AssessmentResponseDto>>> getHistory(){
		Long userId = SecurityUtil.getCurrentUserId();
		List<AssessmentResponseDto> history = assessmentService.getAssessmentHistory(userId);
		return ResponseEntity.ok(ApiResponse.success(history));
	}
	
}
