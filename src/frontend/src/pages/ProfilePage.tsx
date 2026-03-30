import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import {
  Camera,
  Film,
  Grid3X3,
  Loader2,
  Settings,
  Tag,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfileDTO } from "../backend";
import { EditProfileModal } from "../components/EditProfileModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useFollowUser,
  usePostsByUser,
  useUserProfile,
} from "../hooks/useQueries";

interface ProfilePageProps {
  callerProfile: UserProfileDTO | null;
}

const SKELETON_ITEMS_9 = Array.from({ length: 9 });
const SKELETON_ITEMS_6 = Array.from({ length: 6 });

export function ProfilePage({ callerProfile }: ProfilePageProps) {
  const { userId } = useParams({ strict: false }) as { userId?: string };
  const { identity } = useInternetIdentity();
  const [editOpen, setEditOpen] = useState(false);
  const followUser = useFollowUser();

  const callerPrincipal = identity?.getPrincipal();
  const isOwnProfile = !userId || userId === callerPrincipal?.toString();

  let profilePrincipal: Principal | null = null;
  try {
    profilePrincipal = userId
      ? PrincipalClass.fromText(userId)
      : callerPrincipal || null;
  } catch {
    profilePrincipal = callerPrincipal || null;
  }

  const { data: userProfile, isLoading: profileLoading } = useUserProfile(
    isOwnProfile ? null : profilePrincipal,
  );
  const displayProfile = isOwnProfile ? callerProfile : userProfile;

  const { data: posts = [], isLoading: postsLoading } =
    usePostsByUser(profilePrincipal);

  const isFollowing =
    callerProfile?.following.some(
      (p) => p.toString() === profilePrincipal?.toString(),
    ) || false;

  function handleFollow() {
    if (!profilePrincipal || !identity) {
      toast.error("Please log in");
      return;
    }
    followUser.mutate(
      { userId: profilePrincipal, isFollowing },
      {
        onSuccess: () =>
          toast.success(isFollowing ? "Unfollowed" : "Following!"),
        onError: () => toast.error("Action failed"),
      },
    );
  }

  if (profileLoading) {
    return (
      <div data-ocid="profile.loading_state" className="space-y-6 p-4">
        <div className="flex items-start gap-8">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-8">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[1px]">
          {SKELETON_ITEMS_9.map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  const username =
    displayProfile?.username ||
    `${profilePrincipal?.toString().slice(0, 12)}...`;

  return (
    <>
      <div>
        {/* Profile header */}
        <motion.div
          data-ocid="profile.panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pt-6 pb-4"
        >
          <div className="flex items-start gap-8 mb-4">
            {/* Avatar */}
            {isOwnProfile ? (
              <button
                type="button"
                data-ocid="profile.upload_button"
                className="relative cursor-pointer group flex-shrink-0"
                onClick={() => setEditOpen(true)}
              >
                <div className="p-[2px] rounded-full story-ring">
                  <div className="p-[2px] rounded-full bg-background">
                    <Avatar className="w-[77px] h-[77px]">
                      <AvatarImage
                        src={displayProfile?.profilePic?.getDirectURL()}
                      />
                      <AvatarFallback className="bg-muted text-2xl font-bold">
                        {displayProfile?.username?.slice(0, 1).toUpperCase() ||
                          profilePrincipal
                            ?.toString()
                            .slice(0, 2)
                            .toUpperCase() ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
            ) : (
              <div className="p-[2px] rounded-full story-ring flex-shrink-0">
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-[77px] h-[77px]">
                    <AvatarImage
                      src={displayProfile?.profilePic?.getDirectURL()}
                    />
                    <AvatarFallback className="bg-muted text-2xl font-bold">
                      {displayProfile?.username?.slice(0, 1).toUpperCase() ||
                        profilePrincipal
                          ?.toString()
                          .slice(0, 2)
                          .toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}

            {/* Stats & actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-4">
                <h2 className="text-xl font-light text-foreground">
                  {username}
                </h2>
                {isOwnProfile ? (
                  <>
                    <Button
                      data-ocid="profile.edit_button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpen(true)}
                      className="border-border text-foreground hover:bg-muted h-8 px-4 text-sm font-semibold rounded-lg"
                    >
                      Edit profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-muted h-8 px-4 text-sm font-semibold rounded-lg"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    data-ocid="profile.follow.button"
                    onClick={handleFollow}
                    disabled={followUser.isPending}
                    size="sm"
                    className={
                      isFollowing
                        ? "border border-border bg-transparent text-foreground hover:bg-muted h-8 px-4 rounded-lg"
                        : "bg-[#0095f6] hover:bg-[#0095f6]/80 text-white h-8 px-4 rounded-lg text-sm font-semibold"
                    }
                  >
                    {followUser.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-1" /> Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" /> Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {posts.length}{" "}
                  </span>
                  <span className="text-sm text-foreground">posts</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {isOwnProfile
                      ? "999M"
                      : displayProfile?.followers.length || 0}
                  </span>
                  <span className="text-sm text-foreground"> followers</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    {displayProfile?.following.length || 0}
                  </span>
                  <span className="text-sm text-foreground"> following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-2">
            {displayProfile?.bio && (
              <p className="text-sm text-foreground">{displayProfile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Tab bar */}
        <div className="border-t border-border">
          <div className="flex">
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 border-t-2 border-foreground"
            >
              <Grid3X3 className="h-3 w-3" />
              <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">
                Posts
              </span>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-muted-foreground border-t-2 border-transparent"
            >
              <Film className="h-3 w-3" />
              <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">
                Reels
              </span>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-muted-foreground border-t-2 border-transparent"
            >
              <Tag className="h-3 w-3" />
              <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">
                Tagged
              </span>
            </button>
          </div>
        </div>

        {/* Posts grid */}
        <div>
          {postsLoading ? (
            <div className="grid grid-cols-3 gap-[1px]">
              {SKELETON_ITEMS_6.map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              data-ocid="profile.empty_state"
              className="text-center py-16 px-4"
            >
              <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center mx-auto mb-4">
                <Grid3X3
                  className="h-7 w-7 text-muted-foreground"
                  strokeWidth={1}
                />
              </div>
              <p className="text-foreground font-bold text-xl mb-1">
                {isOwnProfile ? "Share Photos" : "No Posts Yet"}
              </p>
              <p className="text-muted-foreground text-sm">
                {isOwnProfile
                  ? "When you share photos, they will appear on your profile."
                  : "This user hasn't posted yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[1px]">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  data-ocid={`profile.item.${i + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="aspect-square overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={post.image.getDirectURL()}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <span className="text-white text-sm font-bold flex items-center gap-1">
                      ♥ {post.likes.length}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        onOpenChange={setEditOpen}
        currentProfile={callerProfile}
      />
    </>
  );
}
