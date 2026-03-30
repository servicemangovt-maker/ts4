import { Bell, Send } from "lucide-react";
import type { UserProfileDTO } from "../../backend";

interface TopHeaderProps {
  callerProfile: UserProfileDTO | null;
  onCreatePost: () => void;
  onNotifications: () => void;
  onMobileMenu?: () => void;
}

export function TopHeader({ onNotifications }: TopHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border h-12 flex items-center px-4">
      {/* Logo center */}
      <div className="flex-1 flex justify-center">
        <span
          className="text-2xl font-bold insta-gradient-text"
          style={{ fontFamily: "cursive, serif" }}
        >
          ts4
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 absolute right-4">
        <button
          type="button"
          data-ocid="header.notifications.button"
          onClick={onNotifications}
          className="text-foreground"
        >
          <Bell className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          data-ocid="header.messages.button"
          className="text-foreground"
        >
          <Send className="h-6 w-6" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
