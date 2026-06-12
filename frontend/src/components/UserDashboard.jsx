import { useState, useEffect } from "react";
import { getMyTasks, updateTaskStatus } from "../api/taskApi";
import { useToast } from "../context/ToastContext";

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "COMPLETED"];

const STATUS_LABELS = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export default function UserDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { addToast } = useToast();

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await getMyTasks();
      if (res.success) {
        setTasks(res.data || []);
      } else {
        addToast(res.message || "Failed to load tasks", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load tasks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId);
    try {
      const res = await updateTaskStatus(taskId, newStatus);
      if (res.success) {
        addToast(res.message || "Status updated!", "success");
        fetchMyTasks();
      } else {
        addToast(res.message || "Failed to update status", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="user-dashboard" id="user-dashboard">
      <div className="panel-header">
        <div>
          <h2>My Tasks</h2>
          <p className="panel-subtitle">View and update your assigned tasks</p>
        </div>
        <div className="stats-row">
          <div className="stat-chip stat-todo">
            <span className="stat-count">{todoTasks.length}</span> To Do
          </div>
          <div className="stat-chip stat-progress">
            <span className="stat-count">{inProgressTasks.length}</span> In Progress
          </div>
          <div className="stat-chip stat-done">
            <span className="stat-count">{completedTasks.length}</span> Done
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l2 2 4-4" />
          </svg>
          <h3>No tasks assigned</h3>
          <p>You don&apos;t have any tasks yet. Check back later!</p>
        </div>
      ) : (
        <div className="task-cards" id="my-tasks-grid">
          {tasks.map((task) => (
            <div key={task.id} className={`task-card task-card-${task.status?.toLowerCase()}`}>
              <div className="task-card-header">
                <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                  {task.priority}
                </span>
                <span className={`badge badge-status-${task.status?.toLowerCase()}`}>
                  {STATUS_LABELS[task.status] || task.status}
                </span>
              </div>

              <h3 className="task-card-title">{task.title}</h3>
              {task.description && (
                <p className="task-card-desc">{task.description}</p>
              )}

              <div className="task-card-meta">
                {task.dueDate && (
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {formatDate(task.dueDate)}
                  </span>
                )}
                {task.createdByName && (
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {task.createdByName}
                  </span>
                )}
              </div>

              <div className="task-card-footer">
                <label className="status-label" htmlFor={`status-${task.id}`}>
                  Update status:
                </label>
                <select
                  id={`status-${task.id}`}
                  className="status-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={updatingId === task.id}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
