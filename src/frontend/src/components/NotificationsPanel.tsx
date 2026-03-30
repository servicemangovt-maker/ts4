import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import type { Notification } from "../backend";
import { useNotifications } from "../hooks/useQueries";
import { formatRelativeTime } from "../utils/time";

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function NotificationItem({
  notif,
  index,
}: { notif: Notification; index: number }) {
  const content = notif.content;
  let icon = <Heart className="h-4 w-4 text-like-red" />;
  let text = "liked your post";
  let who = "";

  if (content.__kind__ === "like") {
    icon = <Heart className="h-4 w-4 fill-like-red text-like-red" />;
    text = "liked your post";
  } else if (content.__kind__ === "comment") {
    icon = <MessageCircle className="h-4 w-4 text-teal" />;
    text = `commented: "${content.comment.comment.text}"`;
    who = `${content.comment.comment.author.toString().slice(0, 10)}...`;
  } else if (content.__kind__ === "follow") {
    icon = <UserPlus className="h-4 w-4 text-purple" />;
    text = "started following you";
    who = `${content.follow.followerId.toString().slice(0, 10)}...`;
  }

  return (
    <div
      data-ocid={`notifications.item.${index}`}
      className="flex items-start gap-3 py-3 border-b border-border last:border-0"
    >
      <Avatar className="w-9 h-9 mt-0.5">
        <AvatarFallback className="bg-muted text-xs">
          {who.slice(0, 2).toUpperCase() || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{who || "Someone"}</span>{" "}
          <span className="text-muted-foreground">{text}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(notif.timestamp)}
        </p>
      </div>
      <div className="mt-1 flex-shrink-0">{icon}</div>
    </div>
  );
}

export function NotificationsPanel({
  open,
  onOpenChange,
}: NotificationsPanelProps) {
  const { data: notifications = [], isLoading } = useNotifications();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-ocid="notifications.sheet"
        side="right"
        className="bg-card border-border w-full max-w-sm"
      >
        <SheetHeader>
          <SheetTitle className="text-foreground">Notifications</SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto h-[calc(100vh-120px)]">
          {isLoading ? (
            <div data-ocid="notifications.loading_state" className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div
              data-ocid="notifications.empty_state"
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">
                No notifications yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                When someone likes or comments on your posts, you'll see it
                here.
              </p>
            </div>
          ) : (
            notifications.map((notif, i) => (
              <NotificationItem
                key={`notif-${Number(notif.timestamp)}-${i}`}
                notif={notif}
                index={i + 1}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
