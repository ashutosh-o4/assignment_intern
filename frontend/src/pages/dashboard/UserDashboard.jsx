import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../apis/axios";
import { useToast } from "../../hooks/useToast";
import { StatusBadge, PriorityBadge } from "../../component/badges";
import "./UserDashboard.css";

export default function UserDashboard() {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active filter state
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Status updating state (tracks ID of task currently updating)
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Drawer state
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [drawerTask, setDrawerTask] = useState(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);

  // --- Data Fetching ---
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/tasks/my");
      setTasks(response.data || []);
    } catch (err) {
      setError("Failed to load your tasks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- Optimistic Status Update ---
  const handleStatusAdvance = useCallback(async (e, task) => {
    e.stopPropagation(); // Prevent opening the drawer
    
    let nextStatus = "TODO";
    if (task.status === "TODO") nextStatus = "IN_PROGRESS";
    else if (task.status === "IN_PROGRESS") nextStatus = "DONE";
    else return; // DONE cannot be advanced

    const originalStatus = task.status;
    
    // 1. Optimistic local update
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: nextStatus } : t
    ));
    setUpdatingTaskId(task.id);

    // 2. Network Request
    try {
      await axiosInstance.patch(`/tasks/my/${task.id}/status`, { status: nextStatus });
    } catch (err) {
      // 3. Revert on failure
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: originalStatus } : t
      ));
      showToast("Failed to update task status", "error");
    } finally {
      setUpdatingTaskId(null);
    }
  }, [showToast]);

  // --- Filtering ---
  const filterCounts = useMemo(() => {
    const counts = { ALL: tasks.length, TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    tasks.forEach(t => {
      if (t.status === "TODO") counts.TODO++;
      else if (t.status === "IN_PROGRESS") counts.IN_PROGRESS++;
      else if (t.status === "DONE") counts.DONE++;
    });
    return counts;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === "ALL") return tasks;
    return tasks.filter(t => t.status === activeFilter);
  }, [tasks, activeFilter]);

  // --- Drawer Handling ---
  const openDrawer = useCallback(async (taskId) => {
    setSelectedTaskId(taskId);
    setDrawerTask(null);
    setIsDrawerLoading(true);
    
    try {
      const response = await axiosInstance.get(`/tasks/my/${taskId}`);
      setDrawerTask(response.data);
    } catch (err) {
      showToast("Failed to load task details", "error");
      closeDrawer();
    } finally {
      setIsDrawerLoading(false);
    }
  }, [showToast]);

  const closeDrawer = () => {
    setSelectedTaskId(null);
    setDrawerTask(null);
  };

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- Rendering Helpers ---
  const getActionButtonProps = (status) => {
    if (status === "TODO") return { label: "Start", className: "start", disabled: false };
    if (status === "IN_PROGRESS") return { label: "Complete", className: "complete", disabled: false };
    return { label: "Completed", className: "done", disabled: true };
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>My Tasks</h1>
        <p>View and manage the tasks assigned to you.</p>
      </div>

      {error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchTasks}>Retry Loading Tasks</button>
        </div>
      ) : (
        <>
          <div className="filters-bar">
            {["ALL", "TODO", "IN_PROGRESS", "DONE"].map(f => (
              <button 
                key={f}
                className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === "ALL" ? "All" : f.replace("_", " ")} ({filterCounts[f]})
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="task-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="shimmer skel-title"></div>
                  <div className="shimmer skel-line"></div>
                  <div className="shimmer skel-line short"></div>
                  <div className="shimmer skel-badges"></div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <div className="shimmer skel-btn"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>No tasks assigned yet</h3>
              <p>Check back later or contact your admin.</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found for the selected filter.</p>
            </div>
          ) : (
            <div className="task-grid">
              {filteredTasks.map(task => {
                const btnProps = getActionButtonProps(task.status);
                const isUpdating = updatingTaskId === task.id;

                return (
                  <div key={task.id} className="task-card" onClick={() => openDrawer(task.id)}>
                    <div className="task-card-header">
                      <h3 className="task-card-title">{task.title}</h3>
                    </div>
                    <p className="task-card-desc">{task.description}</p>
                    
                    <div className="task-card-meta">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      <span className="task-card-due">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                      </span>
                    </div>

                    <div className="task-card-footer">
                      <button 
                        className={`action-btn ${btnProps.className}`}
                        disabled={btnProps.disabled || isUpdating}
                        onClick={(e) => handleStatusAdvance(e, task)}
                      >
                        {isUpdating && <div className="btn-spinner"></div>}
                        {!isUpdating && btnProps.label}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Drawer Overlay */}
      {selectedTaskId && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Task Details</h2>
              <button className="close-drawer-btn" onClick={closeDrawer}>&times;</button>
            </div>
            
            <div className="drawer-body">
              {isDrawerLoading ? (
                <div className="drawer-loading">Loading details...</div>
              ) : drawerTask ? (
                <>
                  <div className="drawer-row">
                    <span className="drawer-label">Title</span>
                    <p className="drawer-value"><strong>{drawerTask.title}</strong></p>
                  </div>
                  
                  <div className="drawer-row">
                    <span className="drawer-label">Description</span>
                    <p className="drawer-value">{drawerTask.description}</p>
                  </div>
                  
                  <div className="drawer-row" style={{ display: 'flex', gap: '1rem' }}>
                    <div>
                      <span className="drawer-label">Status</span>
                      <StatusBadge status={drawerTask.status} />
                    </div>
                    <div>
                      <span className="drawer-label">Priority</span>
                      <PriorityBadge priority={drawerTask.priority} />
                    </div>
                  </div>
                  
                  <div className="drawer-row">
                    <span className="drawer-label">Due Date</span>
                    <p className="drawer-value">
                      {drawerTask.dueDate ? new Date(drawerTask.dueDate).toLocaleDateString() : "Not specified"}
                    </p>
                  </div>

                  <div className="drawer-row">
                    <span className="drawer-label">Assigned By</span>
                    <p className="drawer-value">{drawerTask.createdByName || "System"}</p>
                  </div>

                  <div className="drawer-row">
                    <span className="drawer-label">Created Date</span>
                    <p className="drawer-value">
                      {drawerTask.createdAt ? new Date(drawerTask.createdAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="error-state">Failed to load task data.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
