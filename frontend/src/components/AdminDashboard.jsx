import { useState, useEffect } from "react";
import { getAllTasks, createTask, updateTask, deleteTask } from "../api/taskApi";
import { getAllUsers, deleteUser } from "../api/adminApi";
import { useToast } from "../context/ToastContext";
import TaskForm from "./TaskForm";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { addToast } = useToast();

  // ── Fetch Tasks ──
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await getAllTasks();
      if (res.success) {
        setTasks(res.data || []);
      } else {
        addToast(res.message || "Failed to load tasks", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load tasks", "error");
    } finally {
      setLoadingTasks(false);
    }
  };

  // ── Fetch Users ──
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      } else {
        addToast(res.message || "Failed to load users", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // ── Task CRUD Handlers ──
  const handleCreateTask = async (data) => {
    try {
      const res = await createTask(data);
      if (res.success) {
        addToast(res.message || "Task created!", "success");
        setShowTaskForm(false);
        fetchTasks();
      } else {
        addToast(res.message || "Failed to create task", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to create task", "error");
    }
  };

  const handleUpdateTask = async (data) => {
    try {
      const res = await updateTask(editingTask.id, data);
      if (res.success) {
        addToast(res.message || "Task updated!", "success");
        setShowTaskForm(false);
        setEditingTask(null);
        fetchTasks();
      } else {
        addToast(res.message || "Failed to update task", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update task", "error");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await deleteTask(id);
      if (res.success) {
        addToast(res.message || "Task deleted!", "success");
        fetchTasks();
      } else {
        addToast(res.message || "Failed to delete task", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete task", "error");
    }
  };

  // ── User Delete Handler ──
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await deleteUser(id);
      if (res.success) {
        addToast(res.message || "User deleted!", "success");
        fetchUsers();
        fetchTasks(); // Refresh tasks in case assigned tasks changed
      } else {
        addToast(res.message || "Failed to delete user", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="admin-dashboard">
      {/* ── Tabs ── */}
      <div className="tabs" id="admin-tabs">
        <button
          className={`tab ${activeTab === "tasks" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("tasks")}
          id="tab-tasks"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          Tasks
          <span className="tab-count">{tasks.length}</span>
        </button>
        <button
          className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("users")}
          id="tab-users"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          Users
          <span className="tab-count">{users.length}</span>
        </button>
      </div>

      {/* ── Tasks Tab Content ── */}
      {activeTab === "tasks" && (
        <div className="tab-content" id="tasks-panel">
          <div className="panel-header">
            <div>
              <h2>All Tasks</h2>
              <p className="panel-subtitle">Manage and assign tasks to users</p>
            </div>
            <button className="btn btn-primary" onClick={openCreate} id="create-task-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Task
            </button>
          </div>

          {loadingTasks ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table" id="tasks-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div className="task-title-cell">
                          <span className="task-title">{task.title}</span>
                          {task.description && (
                            <span className="task-desc">{task.description}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-status-${task.status?.toLowerCase()}`}>
                          {task.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-priority-${task.priority?.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td>{task.assignedToName || "—"}</td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => openEdit(task)}
                            title="Edit task"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-sm btn-danger-ghost"
                            onClick={() => handleDeleteTask(task.id)}
                            title="Delete task"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Users Tab Content ── */}
      {activeTab === "users" && (
        <div className="tab-content" id="users-panel">
          <div className="panel-header">
            <div>
              <h2>All Users</h2>
              <p className="panel-subtitle">View and manage registered users</p>
            </div>
          </div>

          {loadingUsers ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table" id="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-sm">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger-ghost"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Task Form Modal ── */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
