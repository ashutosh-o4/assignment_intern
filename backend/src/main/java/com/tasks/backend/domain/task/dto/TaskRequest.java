package com.tasks.backend.domain.task.dto;

import com.tasks.backend.common.enums.Priority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Assigned user ID is required")
    private String assignedToId;

    @FutureOrPresent(message = "Due date must be today or in the future")
    private LocalDate dueDate;
}