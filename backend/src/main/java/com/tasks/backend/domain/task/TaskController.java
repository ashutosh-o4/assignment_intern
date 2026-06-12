package com.tasks.backend.domain.task;

import com.tasks.backend.common.response.ApiResponse;
import com.tasks.backend.domain.task.dto.TaskRequest;
import com.tasks.backend.domain.task.dto.TaskResponse;
import com.tasks.backend.domain.task.dto.TaskStatusUpdateRequest;
import com.tasks.backend.domain.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    private final TaskService taskService;

    // ── ADMIN endpoints ───────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create task", description = "Admin only — create and assign a task")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User admin) {

        TaskResponse response = taskService.createTask(request, admin);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Task created successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all tasks", description = "Admin only — returns every task")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAllTasks() {
        return ResponseEntity.ok(
                ApiResponse.success(taskService.getAllTasks(), "Tasks fetched successfully")
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get task by ID", description = "Admin only")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                ApiResponse.success(taskService.getTaskById(id), "Task fetched successfully")
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update task", description = "Admin only — full update")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(taskService.updateTask(id, request), "Task updated successfully")
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete task", description = "Admin only")
    public ResponseEntity<ApiResponse<String>> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }

    // ── USER endpoints ────────────────────────────────────────────

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get my tasks", description = "User only — returns tasks assigned to me")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(taskService.getMyTasks(user.getId()), "Tasks fetched successfully")
        );
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Get my task by ID", description = "User only — must be assigned to them")
    public ResponseEntity<ApiResponse<TaskResponse>> getMyTaskById(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(taskService.getMyTaskById(id, user.getId()), "Task fetched successfully")
        );
    }

    @PatchMapping("/my/{id}/status")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Update task status", description = "User only — TODO → IN_PROGRESS → DONE")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable String id,
            @Valid @RequestBody TaskStatusUpdateRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        taskService.updateTaskStatus(id, request, user.getId()),
                        "Status updated successfully"
                )
        );
    }
}