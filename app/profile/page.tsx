"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ProfileEditor from "@/components/ProfileEditor";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className={styles.loading} role="status">
        Loading your profile…
      </div>
    );
  if (!user)
    return (
      <div className={styles.loading}>
        Please <Link href="/login?next=/profile">sign in</Link> to edit your
        profile.
      </div>
    );
  return <ProfileEditor key={user.id} user={user} />;
}
