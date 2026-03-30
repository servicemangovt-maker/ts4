import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Comment,
  Notification,
  PostDTO,
  UserProfileDTO,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<PostDTO[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostsByUser(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PostDTO[]>({
    queryKey: ["posts", "user", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getPostsByUser(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserProfileDTO | null>({
    queryKey: ["profile", "caller"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfileDTO | null>({
    queryKey: ["profile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useComments(postId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getComments(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30_000,
  });
}

export function useUsernames(principalStrs: string[]) {
  const { actor, isFetching } = useActor();
  const dedupedStrs = Array.from(new Set(principalStrs)).sort();
  return useQuery<Map<string, string>>({
    queryKey: ["usernames", ...dedupedStrs],
    queryFn: async () => {
      if (!actor || dedupedStrs.length === 0) return new Map();
      const results = await Promise.all(
        dedupedStrs.map(async (str) => {
          try {
            const p = PrincipalClass.fromText(str);
            const profile = await actor.getUserProfile(p);
            const name = profile?.username || `${str.slice(0, 10)}...`;
            return [str, name] as [string, string];
          } catch {
            return [str, `${str.slice(0, 10)}...`] as [string, string];
          }
        }),
      );
      return new Map(results);
    },
    enabled: !!actor && !isFetching && dedupedStrs.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      liked,
    }: { postId: string; liked: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (liked) {
        await actor.unlikePost(postId);
      } else {
        await actor.likePost(postId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addComment(postId, text);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      caption,
      hashtags,
      imageBytes,
    }: {
      caption: string;
      hashtags: string[];
      imageBytes: Uint8Array<ArrayBuffer>;
    }) => {
      if (!actor) throw new Error("Not connected");
      const blob = ExternalBlob.fromBytes(imageBytes);
      return actor.createPost(caption, hashtags, blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deletePost(postId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfileDTO) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      isFollowing,
    }: { userId: Principal; isFollowing: boolean }) => {
      if (!actor) throw new Error("Not connected");
      if (isFollowing) {
        await actor.unfollowUser(userId);
      } else {
        await actor.followUser(userId);
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["profile", vars.userId.toString()] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
