package com.tasks.backend.domain.task;

import com.tasks.backend.common.exception.ResourceNotFoundException;
import com.tasks.backend.common.exception.UnauthorizedException;
import com.tasks.backend.domain.task.dto.TaskRequest;
import com.tasks.backend.domain.task.dto.TaskResponse;
import com.tasks.backend.domain.task.dto.TaskStatusUpdateRequest;
import com.tasks.backend.domain.user.User;
import com.tasks.backend.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.tasks.backend.common.enums.TaskStatus;
import java.util.List;

import static java.text.BreakIterator.DONE;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // ── ADMIN operations ──────────────────────────────────────────

    public TaskResponse createTask(TaskRequest request, User admin) {

        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", request.getAssignedToId()
                ));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.TODO)            // always starts as TODO
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .createdBy(admin)
                .assignedTo(assignedTo)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created: {} assigned to: {}", saved.getId(), assignedTo.getEmail());
        return TaskResponse.from(saved);
    }

    public List<TaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse getTaskById(String taskId) {
        return TaskResponse.from(findTaskOrThrow(taskId));
    }

    public TaskResponse updateTask(String taskId, TaskRequest request) {

        Task task = findTaskOrThrow(taskId);

        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User", request.getAssignedToId()
                ));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignedTo(assignedTo);

        Task updated = taskRepository.save(task);
        log.info("Task updated: {}", updated.getId());
        return TaskResponse.from(updated);
    }

    public void deleteTask(String taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task", taskId);
        }
        taskRepository.deleteById(taskId);
        log.info("Task deleted: {}", taskId);
    }

    // ── USER operations ───────────────────────────────────────────

    public List<TaskResponse> getMyTasks(String userId) {
        return taskRepository.findByAssignedToId(userId)
                .stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse getMyTaskById(String taskId, String userId) {
        Task task = taskRepository.findByIdAndAssignedToId(taskId, userId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Task not found or not assigned to you"
                ));
        return TaskResponse.from(task);
    }

    public TaskResponse updateTaskStatus(String taskId,
                                         TaskStatusUpdateRequest request,
                                         String userId) {

        Task task = taskRepository.findByIdAndAssignedToId(taskId, userId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Task not found or not assigned to you"
                ));

        validateStatusTransition(task.getStatus(), request.getStatus());

        task.setStatus(request.getStatus());
        Task updated = taskRepository.save(task);
        log.info("Task {} status updated to: {}", taskId, request.getStatus());
        return TaskResponse.from(updated);
    }

    // ── helpers ───────────────────────────────────────────────────

    private Task findTaskOrThrow(String taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
    }

    private void validateStatusTransition(TaskStatus current, TaskStatus next) {
        boolean valid = switch (current) {
            case TODO        -> next == TaskStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == TaskStatus.COMPLETED;
            case COMPLETED        -> false;  // terminal state
        };

        if (!valid) {
            throw new UnauthorizedException(
                    "Invalid status transition: " + current + " → " + next
            );
        }
    }
}