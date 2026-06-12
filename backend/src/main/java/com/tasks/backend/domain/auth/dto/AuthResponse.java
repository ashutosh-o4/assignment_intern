package com.tasks.backend.domain.auth.dto;

import com.tasks.backend.common.enums.Role;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private String id;
    private String name;
    private String email;
    private Role role;
}