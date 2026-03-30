import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PostDTO, UserProfileDTO } from "../backend";
import { PostCard } from "../components/PostCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllPosts } from "../hooks/useQueries";

const SAVED_KEY = "ts4_saved_posts";
function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

interface SavedPageProps {
  callerProfile: UserProfileDTO | null;
}

const SKELETON_ITEMS = Array.from({ length: 6 });

export function SavedPage({ callerProfile }: SavedPageProps) {
  const { data: posts = [], isLoading } = useAllPosts();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal() || null;
  const [selectedPost, setSelectedPost] = useState<PostDTO | null>(null);

  const savedIds = new Set(getSaved());
  const savedPosts = posts.filter((p) => savedIds.has(p.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Bookmark className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-bold text-foreground">Saved</h1>
      </div>

      {isLoading ? (
        <div
          className="grid gap-[1px] bg-border"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {SKELETON_ITEMS.map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : savedPosts.length === 0 ? (
        <motion.div
          data-ocid="saved.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
            <Bookmark className="h-8 w-8 text-foreground" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            Save photos and videos
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Save photos and videos that you want to see again. No one is
            notified, and only you can see what you've saved.
          </p>
        </motion.div>
      ) : (
        <div
          className="grid gap-[1px] bg-border"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {savedPosts.map((post, i) => {
            const allHashtags = post.hashtags || [];
            const isVideoPost = allHashtags.includes("_media_video");
            const url = post.image.getDirectURL();
            return (
              <motion.div
                key={post.id}
                data-ocid={`saved.item.${i + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="aspect-square cursor-pointer overflow-hidden relative group bg-muted"
                onClick={() => setSelectedPost(post)}
              >
                {isVideoPost ? (
                  // biome-ignore lint/a11y/useMediaCaption: saved thumbnail
                  <video
                    src={url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    muted
                  />
                ) : (
                  <img
                    src={url}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent
          data-ocid="saved.dialog"
          className="bg-background border-border max-w-[470px] p-0 overflow-hidden"
        >
          {selectedPost && (
            <PostCard
              post={selectedPost}
              callerProfile={callerProfile}
              callerPrincipal={callerPrincipal}
              index={0}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
