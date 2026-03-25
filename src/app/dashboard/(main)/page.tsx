"use client";

import { useAuth } from "@/contexts/AuthContext";
import StoriesBar from "@/components/StoriesBar";
import PostsGrid from "@/components/PostsGrid";

export default function DashboardContentPage() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <div>
      <StoriesBar />
      <PostsGrid />
    </div>
  );
}
