import api from "./api";

export async function getAttendance() {
  const response = await api.get("/attendance");

  return response.data;
}

export async function markAttendance(data) {
  const response = await api.post(
    "/attendance",
    data
  );

  return response.data;
}