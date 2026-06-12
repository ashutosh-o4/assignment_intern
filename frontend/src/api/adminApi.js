import API from "./api";

export const getAllUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await API.delete(`/admin/users/${id}`);
  return response.data;
};
