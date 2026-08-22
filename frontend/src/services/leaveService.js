import api from "./api";

export async function getLeaves() {
  const response = await api.get("/leaves");

  return response.data;
}

export async function createLeave(data) {
  const response = await api.post(
    "/leaves",
    data
  );

  return response.data;
}