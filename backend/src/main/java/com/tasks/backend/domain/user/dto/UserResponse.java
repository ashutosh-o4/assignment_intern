package com.tasks.backend.domain.user.dto;

import com.tasks.backend.common.enums.Role;
import com.tasks.backend.domain.user.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;

    // Static factory — never expose User entity directly
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}