package com.loangauge.authservice.dto.request;

import com.loangauge.authservice.util.FieldMatch;
import com.loangauge.authservice.util.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
@NoArgsConstructor
@AllArgsConstructor
@FieldMatch(field = "newPassword", fieldMatch = "confirmPassword", message = "New Password and Confirm Password do not match")
public class ResetPasswordRequest {

    @NotBlank(message = "Reset token is required")
    private String token;

    @NotBlank(message = "New password is required")
    @ValidPassword
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}