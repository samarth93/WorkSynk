export async function fetchRtcToken(params?: { moderator?: boolean; roomId?: string }) {
  const q = new URLSearchParams();
  if (params?.moderator) q.set("moderator", "true");
  if (params?.roomId) q.set("roomId", params.roomId);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/token?${q.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get token");
  const { token } = await res.json();
  return token as string;
}

export async function startVideoForRoom(roomId: string, startedByUserId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/rooms/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ roomId, startedByUserId }),
  });
  if (!res.ok) throw new Error("Failed to start video room");
  return (await res.json()) as { videoRoomId: string };
}

export async function endVideoForRoom(roomId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/video/rooms/${roomId}/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to end video room");
  return await res.json();
}
