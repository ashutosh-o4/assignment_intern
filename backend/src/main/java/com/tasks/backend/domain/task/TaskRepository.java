package com.tasks.backend.domain.task;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    // Used by USER role — only their assigned tasks
    List<Task> findByAssignedToId(String userId);

    // Used by ADMIN — tasks they created
    List<Task> findByCreatedById(String userId);

    // Used to verify ownership before user updates status
    Optional<Task> findByIdAndAssignedToId(String taskId, String userId);
}