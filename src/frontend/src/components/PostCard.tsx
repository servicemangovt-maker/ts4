import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { PostDTO, UserProfileDTO } from "../backend";
import {
  useAddComment,
  useComments,
  useDeletePost,
  useFollowUser,
  useLikePost,
  useUsernames,
} from "../hooks/useQueries";
import { formatRelativeTime } from "../utils/time";

const SAVED_KEY = "ts4_saved_posts";
function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}
function toggleSaved(id: string): boolean {
  const saved = getSaved();
  const next = saved.includes(id)
    ? saved.filter((s) => s !== id)
    : [...saved, id];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(id);
}

interface PostCardProps {
  post: PostDTO;
  callerProfile: UserProfileDTO | null;
  callerPrincipal: Principal | null;
  index: number;
}

export function PostCard({
  post,
  callerProfile,
  callerPrincipal,
  index,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showFloatHeart, setShowFloatHeart] = useState(false);
  const [bookmarked, setBookmarked] = useState(() =>
    getSaved().includes(post.id),
  );
  const lastTapRef = useRef(0);

  const likeMutation = useLikePost();
  const addCommentMutation = useAddComment();
  const deletePostMutation = useDeletePost();
  const followUser = useFollowUser();
  const { data: comments = [], isLoading: commentsLoading } = useComments(
    showComments ? post.id : null,
  );

  // Resolve author username
  const authorPrincipalStr = post.author.toString();
  const { data: authorUsernames } = useUsernames([authorPrincipalStr]);
  const authorName =
    authorUsernames?.get(authorPrincipalStr) ||
    `${authorPrincipalStr.slice(0, 10)}...`;

  // Resolve comment author usernames when dialog is open
  const commentPrincipals = showComments
    ? comments.map((c) => c.author.toString())
    : [];
  const { data: commentUsernames } = useUsernames(commentPrincipals);

  const isLiked = callerPrincipal
    ? post.likes.some((p) => p.toString() === callerPrincipal.toString())
    : false;
  const isOwner = callerPrincipal
    ? post.author.toString() === callerPrincipal.toString()
    : false;
  const isOwnPost = callerPrincipal?.toString() === post.author.toString();
  const isFollowing =
    callerProfile?.following.some(
      (p) => p.toString() === post.author.toString(),
    ) || false;

  const authorInitial = authorName.slice(0, 1).toUpperCase();
  const imageUrl = post.image.getDirectURL();

  const allHashtags = post.hashtags || [];
  const isVideoPost = allHashtags.includes("_media_video");
  const visibleHashtags = allHashtags.filter((tag) => tag !== "_media_video");

  function handleDoubleTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        handleLike();
        setShowFloatHeart(true);
        setTimeout(() => setShowFloatHeart(false), 800);
      }
    }
    lastTapRef.current = now;
  }

  function handleLike() {
    if (!callerPrincipal) {
      toast.error("Please log in to like posts");
      return;
    }
    likeMutation.mutate({ postId: post.id, liked: isLiked });
  }

  function handleFollow() {
    if (!callerPrincipal) {
      toast.error("Please log in");
      return;
    }
    followUser.mutate({ userId: post.author, isFollowing });
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    if (!callerPrincipal) {
      toast.error("Please log in to comment");
      return;
    }
    addCommentMutation.mutate(
      { postId: post.id, text: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment added!");
        },
        onError: () => toast.error("Failed to add comment"),
      },
    );
  }

  function handleDelete() {
    deletePostMutation.mutate(post.id, {
      onSuccess: () => toast.success("Post deleted"),
      onError: () => toast.error("Failed to delete post"),
    });
  }

  function handleBookmark() {
    const isSaved = toggleSaved(post.id);
    setBookmarked(isSaved);
    toast.success(isSaved ? "Post saved!" : "Post removed from saved");
  }

  const skeletonItems = Array.from({ length: 3 });

  return (
    <>
      <motion.article
        data-ocid={`feed.item.${index}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="border-b border-border pb-2 mb-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-3">
            {/* Story-ring avatar */}
            <div className="p-[2px] rounded-full story-ring">
              <div className="p-[2px] rounded-full bg-background">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {authorName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.timestamp)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOwnPost && (
              <button
                type="button"
                onClick={handleFollow}
                disabled={followUser.isPending}
                className="text-xs font-semibold text-insta-blue"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  data-ocid="feed.dropdown_menu"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                {isOwner && (
                  <DropdownMenuItem
                    data-ocid={`feed.delete_button.${index}`}
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-muted-foreground">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Media */}
        <div
          className="relative w-full bg-muted cursor-pointer select-none"
          style={{ aspectRatio: "1/1" }}
          onDoubleClick={handleDoubleTap}
          onClick={handleDoubleTap}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleDoubleTap();
          }}
        >
          {isVideoPost ? (
            // biome-ignore lint/a11y/useMediaCaption: social media video post
            <video
              src={imageUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
              loop
              muted
              autoPlay
            />
          ) : (
            <img
              src={imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          <AnimatePresence>
            {showFloatHeart && (
              <motion.div
                key="float-heart"
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{ opacity: 0, scale: 3, y: -80 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="h-16 w-16 fill-like-red text-like-red drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid={`feed.toggle.${index}`}
                onClick={handleLike}
                className="p-1.5 -ml-1.5 hover:opacity-70 transition-opacity"
              >
                <Heart
                  className={`h-6 w-6 transition-all ${
                    isLiked ? "fill-like-red text-like-red" : "text-foreground"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
              <button
                type="button"
                data-ocid={`feed.secondary_button.${index}`}
                onClick={() => setShowComments(true)}
                className="p-1.5 hover:opacity-70 transition-opacity"
              >
                <MessageCircle
                  className="h-6 w-6 text-foreground"
                  strokeWidth={1.5}
                />
              </button>
              <button
                type="button"
                className="p-1.5 hover:opacity-70 transition-opacity"
              >
                <Send className="h-6 w-6 text-foreground" strokeWidth={1.5} />
              </button>
            </div>
            <button
              type="button"
              data-ocid={`feed.toggle.bookmark.${index}`}
              onClick={handleBookmark}
              className="p-1.5 -mr-1.5 hover:opacity-70 transition-opacity"
            >
              <Bookmark
                className={`h-6 w-6 transition-all ${
                  bookmarked
                    ? "fill-foreground text-foreground"
                    : "text-foreground"
                }`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Likes */}
          <p className="text-sm font-semibold text-foreground mb-1">
            {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
          </p>

          {/* Caption */}
          <p className="text-sm text-foreground leading-snug mb-1">
            <span className="font-semibold mr-1">{authorName}</span>
            {post.caption}{" "}
            {visibleHashtags.map((tag) => (
              <span key={tag} className="text-insta-blue">
                #{tag}{" "}
              </span>
            ))}
          </p>

          {/* View comments */}
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="text-sm text-muted-foreground mb-1"
          >
            View all comments
          </button>

          {/* Timestamp */}
          <p className="text-[10px] uppercase text-muted-foreground tracking-wide mb-2">
            {formatRelativeTime(post.timestamp)}
          </p>

          {/* Comment input */}
          <div className="flex items-center gap-2 border-t border-border pt-2 pb-1">
            <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback className="bg-muted text-xs">
                {callerProfile?.username?.slice(0, 1).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <Input
              data-ocid={`feed.input.${index}`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="h-7 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 text-muted-foreground placeholder:text-muted-foreground/60 px-0"
            />
            {commentText.trim() && (
              <button
                type="button"
                onClick={handleComment}
                className="text-xs font-semibold text-insta-blue hover:opacity-80 whitespace-nowrap"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </motion.article>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent
          data-ocid="feed.dialog"
          className="bg-card border-border max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">Comments</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
            {commentsLoading ? (
              skeletonItems.map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : comments.length === 0 ? (
              <p
                data-ocid="feed.empty_state"
                className="text-center text-muted-foreground text-sm py-8"
              >
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((c, i) => {
                const cAuthorStr = c.author.toString();
                const cName =
                  commentUsernames?.get(cAuthorStr) ||
                  `${cAuthorStr.slice(0, 12)}...`;
                return (
                  <div
                    key={`${cAuthorStr}-${Number(c.timestamp)}`}
                    data-ocid={`feed.comment.item.${i + 1}`}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-xs">
                        {cName.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {cName}
                      </p>
                      <p className="text-sm text-foreground">{c.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(c.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              data-ocid="feed.comment.input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Write a comment..."
              className="bg-muted border-border text-foreground"
            />
            <Button
              data-ocid="feed.comment.submit_button"
              onClick={handleComment}
              size="sm"
              className="bg-primary text-primary-foreground hover:opacity-80"
              disabled={addCommentMutation.isPending || !commentText.trim()}
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
