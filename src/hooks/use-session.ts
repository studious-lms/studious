import { useMemo } from "react";

export function useSession() {
  // Client-only mock session; replace with real auth later
  const user = useMemo(() => ({
    id: "user_demo_teacher",
    username: "Dr. Smith",
    role: "TEACHER" as const,
  }), []);

  return { user };
}
