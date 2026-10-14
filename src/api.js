const API = "https://notification-backend-qxf1.onrender.com/";

export const STREAM_URL = `${API}/stream`;

export async function sendNotification(payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}

export async function fetchHistory() {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}