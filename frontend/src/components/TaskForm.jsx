import { useState, useEffect } from "react";

export default function TaskForm({ task, users, onSubmit, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [assignedToId, setAssignedToId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      setAssignedToId(task.assignedToId || "");
      setDueDate(task.dueDate || "");
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !assignedToId) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assignedToId,
        dueDate: dueDate || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter to show only USER-role users in the assign dropdown
  const assignableUsers = users.filter((u) => u.role === "USER");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        id="task-form-modal"
      >
        <div className="modal-header">
          <h2>{isEdit ? "Edit Task" : "Create New Task"}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" id="task-form">
          <div className="form-group">
            <label htmlFor="task-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              placeholder="Optional task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority">
                Priority <span className="required">*</span>
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-due-date">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-assignee">
              Assign To <span className="required">*</span>
            </label>
            <select
              id="task-assignee"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a user
              </option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !title.trim() || !assignedToId}
              id="task-form-submit"
            >
              {submitting ? <span className="btn-spinner" /> : null}
              {isEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
