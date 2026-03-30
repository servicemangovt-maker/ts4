import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  module Comment {
    public func compare(comment1 : Comment, comment2 : Comment) : Order.Order {
      Int.compare(comment2.timestamp, comment1.timestamp);
    };
  };

  module Post {
    public func compareByTimestamp(post1 : Post, post2 : Post) : Order.Order {
      if (post1.timestamp > post2.timestamp) {
        #less;
      } else if (post1.timestamp < post2.timestamp) {
        #greater;
      } else {
        #equal;
      };
    };
  };

  // Types
  type Notification = {
    timestamp : Int;
    content : NotificationContent;
  };

  type NotificationContent = {
    #like : { postId : Text };
    #comment : { postId : Text; comment : Comment };
    #follow : { followerId : Principal };
  };

  module Notification {
    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      Int.compare(notification2.timestamp, notification1.timestamp);
    };
  };

  type Comment = {
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type Post = {
    id : Text;
    author : Principal;
    caption : Text;
    hashtags : [Text];
    image : Storage.ExternalBlob;
    timestamp : Int;
    likes : List.List<Principal>;
  };

  type PostDTO = {
    id : Text;
    author : Principal;
    caption : Text;
    hashtags : [Text];
    image : Storage.ExternalBlob;
    timestamp : Int;
    likes : [Principal];
  };

  type UserProfile = {
    username : Text;
    bio : Text;
    followers : List.List<Principal>;
    following : List.List<Principal>;
    profilePic : ?Storage.ExternalBlob;
    notifications : List.List<Notification>;
  };

  type UserProfileDTO = {
    username : Text;
    bio : Text;
    followers : [Principal];
    following : [Principal];
    profilePic : ?Storage.ExternalBlob;
    notifications : [Notification];
  };

  // Helper functions
  func getUserProfileInternal(userId : Principal) : UserProfile {
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  func follow(follower : Principal, followed : Principal) {
    if (follower == followed) {
      return;
    };
    let followerProfile = getUserProfileInternal(follower);
    if (followerProfile.following.contains(followed)) {
      return;
    };
    followerProfile.following.add(followed : Principal);
    let followedProfile = getUserProfileInternal(followed);
    followedProfile.followers.add(follower);

    let notification : Notification = {
      timestamp = Time.now();
      content = #follow { followerId = follower };
    };
    followedProfile.notifications.add(notification);
  };

  // Properties
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Text, Post>();
  let comments = Map.empty<Text, List.List<Comment>>();
  let postIdCounter = Map.empty<Text, Nat>();
  let followers = Map.empty<Principal, List.List<Principal>>();
  let following = Map.empty<Principal, List.List<Principal>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let trendingHashtags = Map.empty<Text, Nat>();
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Profile logic
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfileDTO) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let existing = userProfiles.get(caller);
    let newProfile : UserProfile = {
      profile with
      followers = switch (existing) { case (?p) { p.followers }; case (null) { List.empty<Principal>() } };
      following = switch (existing) { case (?p) { p.following }; case (null) { List.empty<Principal>() } };
      notifications = switch (existing) { case (?p) { p.notifications }; case (null) { List.empty<Notification>() } };
    };
    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfileDTO {
    // Public endpoint - no authorization required
    switch (userProfiles.get(user)) {
      case (?profile) {
        ?{
          username = profile.username;
          bio = profile.bio;
          followers = profile.followers.toArray();
          following = profile.following.toArray();
          profilePic = profile.profilePic;
          notifications = profile.notifications.toArray();
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfileDTO {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        ?{
          username = profile.username;
          bio = profile.bio;
          followers = profile.followers.toArray();
          following = profile.following.toArray();
          profilePic = profile.profilePic;
          notifications = profile.notifications.toArray();
        };
      };
      case (null) { null };
    };
  };

  // Post logic
  public shared ({ caller }) func createPost(caption : Text, hashtags : [Text], image : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let timestamp = Time.now();
    let postId = "post_" # timestamp.toText();

    let newPost : Post = {
      id = postId;
      author = caller;
      caption;
      hashtags;
      image;
      timestamp;
      likes = List.empty<Principal>();
    };

    posts.add(postId, newPost);
    postId;
  };

  public shared ({ caller }) func deletePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    let post = switch (posts.get(postId)) {
      case (?post) { post };
      case (null) { Runtime.trap("Post not found") };
    };

    if (post.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own posts");
    };

    posts.remove(postId);
  };

  public query ({ caller }) func getPost(postId : Text) : async ?PostDTO {
    // Public endpoint - no authorization required
    switch (posts.get(postId)) {
      case (?post) {
        ?{
          post with
          likes = post.likes.toArray();
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [PostDTO] {
    // Public endpoint - no authorization required
    posts.values().toArray().filter(
      func(post) {
        post.author == user;
      }
    ).sort(Post.compareByTimestamp).map(
      func(post) {
        {
          post with
          likes = post.likes.toArray();
        };
      }
    );
  };

  // Comment logic
  public shared ({ caller }) func addComment(postId : Text, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let comment : Comment = {
      author = caller;
      text;
      timestamp = Time.now();
    };

    let postComments = switch (comments.get(postId)) {
      case (null) { 
        let newList = List.empty<Comment>();
        comments.add(postId, newList);
        newList;
      };
      case (?existing) { existing };
    };

    postComments.add(comment);

    // Notify post author
    let post = switch (posts.get(postId)) {
      case (?p) { p };
      case (null) { return };
    };

    if (post.author != caller) {
      let authorProfile = switch (userProfiles.get(post.author)) {
        case (?profile) { profile };
        case (null) { return };
      };

      let notification : Notification = {
        timestamp = Time.now();
        content = #comment { postId; comment };
      };
      authorProfile.notifications.add(notification);
    };
  };

  public query ({ caller }) func getComments(postId : Text) : async [Comment] {
    // Public endpoint - no authorization required
    switch (comments.get(postId)) {
      case (null) { [] };
      case (?postComments) { postComments.toArray().sort() };
    };
  };

  public query ({ caller }) func getAllPosts() : async [PostDTO] {
    // Public endpoint - no authorization required (feed functionality)
    posts.values().toArray().sort(
      Post.compareByTimestamp
    ).map(
        func(post) {
          {
            post with
            likes = post.likes.toArray();
          };
        }
      );
  };

  // Like logic
  public shared ({ caller }) func likePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    let post = switch (posts.get(postId)) {
      case (?post) { post };
      case (null) { Runtime.trap("Post not found") };
    };

    if (post.likes.contains(caller)) {
      Runtime.trap("Already liked");
    };
    post.likes.add(caller);

    // Notify post author
    if (post.author != caller) {
      let authorProfile = switch (userProfiles.get(post.author)) {
        case (?profile) { profile };
        case (null) { return };
      };

      let notification : Notification = {
        timestamp = Time.now();
        content = #like { postId };
      };
      authorProfile.notifications.add(notification);
    };
  };

  public shared ({ caller }) func unlikePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    let post = switch (posts.get(postId)) {
      case (?post) { post };
      case (null) { Runtime.trap("Post not found") };
    };

    let updatedLikes = post.likes.filter(func(user) { user != caller });
    post.likes.clear();
    post.likes.addAll(updatedLikes.values());
  };

  public query ({ caller }) func getLikeCount(postId : Text) : async Nat {
    // Public endpoint - no authorization required
    switch (posts.get(postId)) {
      case (?post) { post.likes.size() };
      case (null) { 0 };
    };
  };

  // Follow logic
  public shared ({ caller }) func followUser(userIdToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow other users");
    };
    follow(caller, userIdToFollow);
  };

  public shared ({ caller }) func unfollowUser(userIdToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow users");
    };
    let callerProfile = getUserProfileInternal(caller);
    if (not callerProfile.following.contains(userIdToUnfollow)) {
      Runtime.trap("Not following this user");
    };
    let updatedFollowing = callerProfile.following.filter(func(user) { user != userIdToUnfollow });
    callerProfile.following.clear();
    callerProfile.following.addAll(updatedFollowing.values());

    let unfollowedProfile = getUserProfileInternal(userIdToUnfollow);
    let updatedFollowers = unfollowedProfile.followers.filter(func(user) { user != caller });
    unfollowedProfile.followers.clear();
    unfollowedProfile.followers.addAll(updatedFollowers.values());
  };

  public query ({ caller }) func getFollowers(userId : Principal) : async [Principal] {
    // Public endpoint - no authorization required
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.followers.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(userId : Principal) : async [Principal] {
    // Public endpoint - no authorization required
    switch (userProfiles.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.following.toArray() };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their notifications");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile.notifications.toArray().sort() };
    };
  };
};
