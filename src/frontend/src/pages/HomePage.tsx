import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfileDTO } from "../backend";
import { PostCard } from "../components/PostCard";
import { StoriesBar } from "../components/StoriesBar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllPosts } from "../hooks/useQueries";

interface HomePageProps {
  callerProfile: UserProfileDTO | null;
}

const SKELETON_ITEMS = Array.from({ length: 3 });

export function HomePage({ callerProfile }: HomePageProps) {
  const { data: posts = [], isLoading } = useAllPosts();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal() || null;

  const sortedPosts = [...posts].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div>
      <StoriesBar />

      {isLoading ? (
        <div className="space-y-0">
          {SKELETON_ITEMS.map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              key={i}
              data-ocid="feed.loading_state"
              className="border-b border-border"
            >
              <div className="flex items-center gap-3 p-4">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-full aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <motion.div
          data-ocid="feed.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center mb-5">
            <ImageIcon
              className="h-9 w-9 text-muted-foreground"
              strokeWidth={1}
            />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Share Photos
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            When you share photos, they will appear on your profile.
          </p>
          <button
            type="button"
            className="mt-4 text-sm font-semibold text-insta-blue"
          >
            Share your first photo
          </button>
        </motion.div>
      ) : (
        <div>
          {sortedPosts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              callerProfile={callerProfile}
              callerPrincipal={callerPrincipal}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
