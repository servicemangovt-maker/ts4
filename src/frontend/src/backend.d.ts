import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PostDTO {
    id: string;
    hashtags: Array<string>;
    author: Principal;
    likes: Array<Principal>;
    timestamp: bigint;
    caption: string;
    image: ExternalBlob;
}
export interface Comment {
    text: string;
    author: Principal;
    timestamp: bigint;
}
export interface Notification {
    content: NotificationContent;
    timestamp: bigint;
}
export type NotificationContent = {
    __kind__: "like";
    like: {
        postId: string;
    };
} | {
    __kind__: "comment";
    comment: {
        comment: Comment;
        postId: string;
    };
} | {
    __kind__: "follow";
    follow: {
        followerId: Principal;
    };
};
export interface UserProfileDTO {
    bio: string;
    username: string;
    notifications: Array<Notification>;
    followers: Array<Principal>;
    following: Array<Principal>;
    profilePic?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: string, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(caption: string, hashtags: Array<string>, image: ExternalBlob): Promise<string>;
    deletePost(postId: string): Promise<void>;
    followUser(userIdToFollow: Principal): Promise<void>;
    getAllPosts(): Promise<Array<PostDTO>>;
    getCallerUserProfile(): Promise<UserProfileDTO | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(postId: string): Promise<Array<Comment>>;
    getFollowers(userId: Principal): Promise<Array<Principal>>;
    getFollowing(userId: Principal): Promise<Array<Principal>>;
    getLikeCount(postId: string): Promise<bigint>;
    getNotifications(): Promise<Array<Notification>>;
    getPost(postId: string): Promise<PostDTO | null>;
    getPostsByUser(user: Principal): Promise<Array<PostDTO>>;
    getUserProfile(user: Principal): Promise<UserProfileDTO | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfileDTO): Promise<void>;
    unfollowUser(userIdToUnfollow: Principal): Promise<void>;
    unlikePost(postId: string): Promise<void>;
}
