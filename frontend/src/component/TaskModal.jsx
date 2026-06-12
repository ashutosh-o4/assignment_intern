import { useState, useEffect } from "react";
import axiosInstance from "../apis/axios";
import { useToast } from "../hooks/useToast";
import "./TaskModal.css";

export default function TaskModal({ isOpen, onClose, onSuccess, taskToEdit }) {
  const { showToast } = useToast();
  const isEditMode = !!taskToEdit;

  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: ""
  });
  
  const [errors, setErrors] = useState({});

  // Reset or initialize form whenever the modal opens or taskToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && taskToEdit) {
        setFormData({
          title: taskToEdit.title || "",
          description: taskToEdit.description || "",
          priority: taskToEdit.priority || "MEDIUM",
          assignedTo: taskToEdit.assignedTo || "",
          dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ""
        });
      } else {
        // Reset for create mode
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          assignedTo: "",
          dueDate: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditMode, taskToEdit]);

  // Fetch users for the "Assigned To" dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await axiosInstance.get("/admin/users");
        setUsers(response.data || []);
      } catch (error) {
        showToast("Failed to load users for assignment dropdown", "error");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen, showToast]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.assignedTo) newErrors.assignedTo = "Please assign this task to a user";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await axiosInstance.put(`/tasks/${taskToEdit.id}`, formData);
        showToast("Task updated successfully", "success");
      } else {
        await axiosInstance.post("/tasks", formData);
        showToast("Task created successfully", "success");
      }
      onSuccess(); // Refresh the parent's data
      onClose(); // Hide modal
    } catch (error) {
      const message = error.response?.data?.message || "An error occurred while saving the task";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditMode ? "Edit Task" : "Create New Task"}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={`modal-input ${errors.title ? "input-error" : ""}`}
              placeholder="Task title"
              disabled={isSubmitting}
            />
            <div className="error-text" style={{ visibility: errors.title ? "visible" : "hidden" }}>
              {errors.title || " "}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`modal-textarea ${errors.description ? "input-error" : ""}`}
              placeholder="Task description"
              disabled={isSubmitting}
            />
            <div className="error-text" style={{ visibility: errors.description ? "visible" : "hidden" }}>
              {errors.description || " "}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`modal-select ${errors.priority ? "input-error" : ""}`}
              disabled={isSubmitting}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <div className="error-text" style={{ visibility: errors.priority ? "visible" : "hidden" }}>
              {errors.priority || " "}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className={`modal-select ${errors.assignedTo ? "input-error" : ""}`}
              disabled={isSubmitting || isLoadingUsers}
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
              ))}
            </select>
            <div className="error-text" style={{ visibility: errors.assignedTo ? "visible" : "hidden" }}>
              {errors.assignedTo || " "}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              className={`modal-input ${errors.dueDate ? "input-error" : ""}`}
              disabled={isSubmitting}
            />
            <div className="error-text" style={{ visibility: errors.dueDate ? "visible" : "hidden" }}>
              {errors.dueDate || " "}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
