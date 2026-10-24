"use client";
import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import Editor from "./Editor";
import Library from "./Library";
export default function Workspace({ library = false }: { library?: boolean }) {
  const auth = useAuth();
  const id = auth.user?.id;
  const name = auth.user?.name;
  const user = useMemo(
    () => (id ? { id, name: name || "REERHUB member" } : null),
    [id, name],
  );
  if (auth.loading)
    return (
      <main id="main-content" className="workspace-pending" role="status">
        Opening your resume workspace…
      </main>
    );
  return library ? (
    <Library key={id || "guest"} user={user} jobsUrl="" />
  ) : (
    <Editor
      key={id || "guest"}
      user={user}
      onSignOut={auth.logout}
      jobsUrl=""
    />
  );
}
