import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import axiosInstance from "../../apis/axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'users'

  // Task State
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState("");

  // User State
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");

  // --- Tasks API ---
  const fetchTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    setTasksError("");
    try {
      const response = await axiosInstance.get("/tasks");
      setTasks(response.data || []);
    } catch (error) {
      setTasksError("Failed to load tasks.");
      showToast("Error loading tasks", "error");
    } finally {
      setIsLoadingTasks(false);
    }
  }, [showToast]);

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      showToast("Task deleted successfully", "success");
      fetchTasks(); // Refresh list
    } catch (error) {
      showToast("Failed to delete task", "error");
    }
  };

  // --- Users API ---
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError("");
    try {
      const response = await axiosInstance.get("/admin/users");
      setUsers(response.data || []);
    } catch (error) {
      setUsersError("Failed to load users.");
      showToast("Error loading users", "error");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [showToast]);

  const handleDeleteUser = async (id) => {
    if (id === user.id) {
      showToast("Action forbidden: You cannot delete your own account.", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      showToast("User deleted successfully", "success");
      fetchUsers(); // Refresh list
    } catch (error) {
      showToast("Failed to delete user", "error");
    }
  };

  // --- Lifecycle ---
  useEffect(() => {
    if (activeTab === "tasks") {
      fetchTasks();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, fetchTasks, fetchUsers]);

  // --- Derived State (Metrics) ---
  const metrics = useMemo(() => {
    let todo = 0;
    let inProgress = 0;
    let done = 0;

    tasks.forEach(task => {
      if (task.status === "TODO") todo++;
      else if (task.status === "IN_PROGRESS") inProgress++;
      else if (task.status === "DONE") done++;
    });

    return {
      total: tasks.length,
      todo,
      inProgress,
      done
    };
  }, [tasks]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage application tasks and system users.</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          Tasks Management
        </button>
        <button 
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users Management
        </button>
      </div>

      {activeTab === "tasks" && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Tasks</h3>
              <p className="metric-value">{metrics.total}</p>
            </div>
            <div className="metric-card">
              <h3>To Do</h3>
              <p className="metric-value">{metrics.todo}</p>
            </div>
            <div className="metric-card">
              <h3>In Progress</h3>
              <p className="metric-value">{metrics.inProgress}</p>
            </div>
            <div className="metric-card">
              <h3>Done</h3>
              <p className="metric-value">{metrics.done}</p>
            </div>
          </div>

          {tasksError && <div className="error-state">{tasksError}</div>}
          
          {isLoadingTasks ? (
            <div className="loading-state">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No tasks found. Create a task to get started!</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.assignedTo || "Unassigned"}</td>
                      <td>
                        <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className={`priority-${task.priority?.toLowerCase()}`}>
                        {task.priority}
                      </td>
                      <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                      <td>
                        <button className="action-btn btn-edit" onClick={() => showToast("Edit modal not implemented", "success")}>
                          Edit
                        </button>
                        <button className="action-btn btn-delete" onClick={() => handleDeleteTask(task.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <>
          {usersError && <div className="error-state">{usersError}</div>}
          
          {isLoadingUsers ? (
            <div className="loading-state">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found.</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-badge ${u.role === 'ADMIN' ? 'status-in_progress' : 'status-todo'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                      <td>
                        <button className="action-btn btn-delete" onClick={() => handleDeleteUser(u.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
