import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { UserProfileDTO } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useAllPosts,
  useFollowUser,
  useUsernames,
} from "../../hooks/useQueries";

interface RightSidebarProps {
  callerProfile: UserProfileDTO | null;
}

const SKELETON_ITEMS = Array.from({ length: 5 });

export function RightSidebar({ callerProfile }: RightSidebarProps) {
  const { data: posts = [], isLoading } = useAllPosts();
  const { identity } = useInternetIdentity();
  const followUser = useFollowUser();
  const callerPrincipal = identity?.getPrincipal();

  const followingSet = new Set(
    callerProfile?.following.map((p) => p.toString()) || [],
  );
  const authorMap = new Map<string, Principal>();
  for (const post of posts) {
    const key = post.author.toString();
    if (key !== callerPrincipal?.toString() && !followingSet.has(key)) {
      authorMap.set(key, post.author);
    }
  }
  const suggestions = Array.from(authorMap.entries()).slice(0, 5);
  const suggestionPrincipals = suggestions.map(([str]) => str);
  const { data: suggestionUsernames } = useUsernames(suggestionPrincipals);

  function handleFollow(userId: Principal, prinStr: string) {
    if (!identity) {
      toast.error("Please log in to follow users");
      return;
    }
    const isFollowing = followingSet.has(prinStr);
    followUser.mutate({ userId, isFollowing });
  }

  const username =
    callerProfile?.username || callerPrincipal?.toString().slice(0, 12) || "";

  return (
    <aside className="w-[320px] flex-shrink-0 pt-6">
      {/* Current user */}
      {callerPrincipal && (
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/profile/$userId"
            params={{ userId: callerPrincipal.toString() }}
            data-ocid="sidebar.profile.link"
          >
            <Avatar className="w-11 h-11">
              <AvatarImage src={callerProfile?.profilePic?.getDirectURL()} />
              <AvatarFallback className="bg-muted text-sm font-bold">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {username}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {callerProfile?.bio || ""}
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-insta-blue hover:text-foreground transition-colors"
          >
            Switch
          </button>
        </div>
      )}

      {/* Suggestions */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Suggested for you
          </span>
          <button
            type="button"
            className="text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors"
          >
            See All
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {SKELETON_ITEMS.map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No suggestions yet
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map(([prinStr, principal], i) => {
              const displayName =
                suggestionUsernames?.get(prinStr) ||
                `${prinStr.slice(0, 12)}...`;
              return (
                <div
                  key={prinStr}
                  data-ocid={`suggestions.item.${i + 1}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {displayName.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Suggested for you
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`suggestions.follow.button.${i + 1}`}
                    onClick={() => handleFollow(principal, prinStr)}
                    className="text-xs font-semibold text-insta-blue hover:text-foreground transition-colors"
                  >
                    Follow
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6">
        <p className="text-xs text-muted-foreground leading-relaxed">
          About · Help · Press · API · Jobs · Privacy · Terms · Locations
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          © {new Date().getFullYear()} ts4. Built with{" "}
          <span className="text-like-red">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
