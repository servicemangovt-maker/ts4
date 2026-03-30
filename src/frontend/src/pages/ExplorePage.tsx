import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Compass, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { PostDTO, UserProfileDTO } from "../backend";
import { PostCard } from "../components/PostCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllPosts, useUserProfile, useUsernames } from "../hooks/useQueries";

interface ExplorePageProps {
  callerProfile: UserProfileDTO | null;
}

const SKELETON_ITEMS = Array.from({ length: 9 });

function UserCard({
  principalStr,
  username,
}: { principalStr: string; username: string }) {
  const navigate = useNavigate();
  const principal = useMemo(() => {
    try {
      return PrincipalClass.fromText(principalStr);
    } catch {
      return null;
    }
  }, [principalStr]);
  const { data: profile } = useUserProfile(principal);

  const avatarUrl = profile?.profilePic
    ? profile.profilePic.getDirectURL?.()
    : null;
  const initials = username.slice(0, 2).toUpperCase();
  const bio = profile?.bio || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
    >
      {/* Avatar */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden ${
          avatarUrl
            ? "ring-2 ring-purple-500"
            : "bg-gradient-to-br from-purple-500 to-pink-500"
        }`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">
          @{username}
        </p>
        {bio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{bio}</p>
        )}
      </div>

      {/* View Profile */}
      <button
        type="button"
        data-ocid="people.view_profile.button"
        onClick={() =>
          navigate({ to: "/profile/$userId", params: { userId: principalStr } })
        }
        className="flex-shrink-0 text-xs border border-border rounded-lg px-3 py-1.5 text-foreground hover:bg-muted transition-colors"
      >
        View
      </button>
    </motion.div>
  );
}

export function ExplorePage({ callerProfile }: ExplorePageProps) {
  const { data: posts = [], isLoading } = useAllPosts();
  const { identity } = useInternetIdentity();
  const callerPrincipal = identity?.getPrincipal() || null;
  const [searchQuery, setSearchQuery] = useState("");
  const [peopleQuery, setPeopleQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<PostDTO | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Extract unique author principal strings
  const authorPrincipals = useMemo(() => {
    const set = new Set<string>();
    for (const post of posts) {
      set.add(post.author.toString());
    }
    return Array.from(set).slice(0, 50);
  }, [posts]);

  const { data: usernameMap = new Map<string, string>() } =
    useUsernames(authorPrincipals);

  // Filter users by people search query
  const filteredUsers = useMemo(() => {
    const q = peopleQuery.toLowerCase().trim();
    const entries = Array.from(usernameMap.entries());
    const filtered = q
      ? entries.filter(([, name]) => name.toLowerCase().includes(q))
      : entries;
    return filtered.slice(0, 20);
  }, [usernameMap, peopleQuery]);

  // Extract all unique hashtags
  const hashtagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.hashtags) {
      if (tag !== "_media_video") {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      }
    }
  }
  const trendingTags = Array.from(hashtagCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      post.caption.toLowerCase().includes(q) ||
      post.hashtags.some((h) => h.toLowerCase().includes(q));
    const matchesTag = !activeTag || post.hashtags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="posts">
        <TabsList
          data-ocid="explore.tab"
          className="w-full bg-muted rounded-xl mb-4"
        >
          <TabsTrigger
            value="posts"
            className="flex-1 data-[state=active]:bg-background rounded-lg"
          >
            <Compass className="h-4 w-4 mr-1.5" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="flex-1 data-[state=active]:bg-background rounded-lg"
          >
            <Users className="h-4 w-4 mr-1.5" />
            People
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4 mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="explore.search_input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveTag(null);
              }}
              placeholder="Search posts, hashtags..."
              className="pl-9 bg-muted border-transparent focus-visible:border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          {trendingTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !activeTag
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {trendingTags.slice(0, 12).map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? "bg-foreground text-background"
                      : "bg-muted text-insta-blue hover:bg-muted/80"
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
          )}

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
          ) : filteredPosts.length === 0 ? (
            <motion.div
              data-ocid="explore.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Compass className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">
                {searchQuery || activeTag
                  ? "No posts found"
                  : "Nothing to explore yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {searchQuery || activeTag
                  ? "Try a different search"
                  : "Be the first to share content!"}
              </p>
            </motion.div>
          ) : (
            <div
              className="grid gap-[1px] bg-border"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
            >
              {filteredPosts.map((post, i) => {
                const allHashtags = post.hashtags || [];
                const isVideoPost = allHashtags.includes("_media_video");
                const url = post.image.getDirectURL();
                return (
                  <motion.div
                    key={post.id}
                    data-ocid={`explore.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="aspect-square cursor-pointer overflow-hidden relative group bg-muted"
                    onClick={() => setSelectedPost(post)}
                  >
                    {isVideoPost ? (
                      // biome-ignore lint/a11y/useMediaCaption: explore thumbnail
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
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="text-white text-xs font-semibold">
                        ❤️ {post.likes.length}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4 mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="people.search_input"
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="Search people by username..."
              className="pl-9 bg-muted border-transparent focus-visible:border-border text-foreground placeholder:text-muted-foreground rounded-xl"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <motion.div
              data-ocid="people.empty_state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">
                {peopleQuery ? "No users found" : "No users yet"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {peopleQuery
                  ? "Try a different name"
                  : "Start following people!"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(([principalStr, username], i) => (
                <div key={principalStr} data-ocid={`people.item.${i + 1}`}>
                  <UserCard principalStr={principalStr} username={username} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post detail dialog */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent
          data-ocid="explore.dialog"
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
