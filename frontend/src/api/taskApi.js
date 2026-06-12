import API from "./api";

// ── Admin endpoints ──

export const getAllTasks = async () => {
  const response = await API.get("/tasks");
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await API.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data) => {
  const response = await API.post("/tasks", data);
  return response.data;
};

export const updateTask = async (id, data) => {
  const response = await API.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

// ── User endpoints ──

export const getMyTasks = async () => {
  const response = await API.get("/tasks/my");
  return response.data;
};

export const getMyTaskById = async (id) => {
  const response = await API.get(`/tasks/my/${id}`);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await API.patch(`/tasks/my/${id}/status`, { status });
  return response.data;
};
