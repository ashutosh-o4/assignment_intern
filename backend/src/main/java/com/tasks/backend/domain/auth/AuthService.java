package com.tasks.backend.domain.auth;

import com.tasks.backend.common.enums.Role;
import com.tasks.backend.common.exception.DuplicateResourceException;
import com.tasks.backend.common.security.JwtUtil;
import com.tasks.backend.domain.auth.dto.AuthResponse;
import com.tasks.backend.domain.auth.dto.LoginRequest;
import com.tasks.backend.domain.auth.dto.RegisterRequest;
import com.tasks.backend.domain.user.User;
import com.tasks.backend.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {

        // 1. Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail()
            );
        }

        // 2. Build and save user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .build();

        userRepository.save(user);
        log.info("New user registered: {} with role: {}", user.getEmail(), user.getRole());

        // 3. Generate JWT with role claim
        String token = jwtUtil.generateToken(user, Map.of("role", user.getRole()));

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {

        // 1. Authenticate — throws BadCredentialsException if wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Load user and generate token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String token = jwtUtil.generateToken(user, Map.of("role", user.getRole()));
        log.info("User logged in: {}", user.getEmail());

        return buildAuthResponse(user, token);
    }

    // ── private helpers ───────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}