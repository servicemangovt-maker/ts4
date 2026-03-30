import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Compass,
  Film,
  Home,
  LogOut,
  MessageSquare,
  Phone,
  PlusSquare,
  Radio,
  Settings,
  User,
} from "lucide-react";
import type { UserProfileDTO } from "../../backend";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface LeftSidebarProps {
  callerProfile: UserProfileDTO | null;
  onCreatePost: () => void;
  onNotifications: () => void;
}

const navItems = [
  { to: "/", icon: Home, label: "Home", exact: true },
  { to: "/explore", icon: Compass, label: "Search", exact: false },
  { to: "/reels", icon: Film, label: "Reels", exact: false },
  { to: "/messages", icon: MessageSquare, label: "Messages", exact: false },
  { to: "/calls", icon: Phone, label: "Calls", exact: false },
  { to: "/live", icon: Radio, label: "Live", exact: false, isLive: true },
];

function NavLink({
  to,
  icon: Icon,
  label,
  exact,
  ocid,
  isLive,
}: {
  to: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
  label: string;
  exact: boolean;
  ocid: string;
  isLive?: boolean;
}) {
  const { location } = useRouterState();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link to={to} data-ocid={ocid}>
      <div
        className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-sidebar-accent ${
          isActive ? "font-bold" : ""
        }`}
      >
        <div className="relative">
          <Icon
            className={`h-6 w-6 ${
              isLive ? "text-red-500" : "text-sidebar-foreground"
            }`}
            strokeWidth={isActive ? 2.5 : 1.5}
          />
          {isLive && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
        <span
          className={`hidden xl:block text-sm ${
            isLive ? "text-red-500" : "text-sidebar-foreground"
          } ${isActive ? "font-bold" : "font-normal"}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

export function LeftSidebar({
  callerProfile,
  onCreatePost,
  onNotifications,
}: LeftSidebarProps) {
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const isLoggedIn = !!identity;
  const callerPrincipal = identity?.getPrincipal().toString();
  const { location } = useRouterState();
  const isProfileActive = callerPrincipal
    ? location.pathname === `/profile/${callerPrincipal}`
    : false;
  const isSettingsActive = location.pathname === "/settings";
  const isSavedActive = location.pathname === "/saved";

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[68px] xl:w-[244px] bg-sidebar border-r border-sidebar-border flex-col py-4 px-2 xl:px-3 z-40">
      {/* Logo */}
      <div className="flex items-center justify-center xl:justify-start px-3 h-16 mb-4">
        <span
          className="text-2xl font-bold insta-gradient-text hidden xl:block"
          style={{ fontFamily: "cursive, serif" }}
        >
          ts4
        </span>
        <span
          className="xl:hidden text-xl font-bold insta-gradient-text"
          style={{ fontFamily: "cursive, serif" }}
        >
          ts4
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon, label, exact, isLive }) => (
          <NavLink
            key={to}
            to={to}
            icon={icon}
            label={label}
            exact={exact}
            ocid={`nav.${label.toLowerCase()}.link`}
            isLive={isLive}
          />
        ))}

        {/* Notifications */}
        <button
          type="button"
          data-ocid="nav.notifications.button"
          onClick={onNotifications}
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          <Bell className="h-6 w-6" strokeWidth={1.5} />
          <span className="hidden xl:block text-sm font-normal">
            Notifications
          </span>
        </button>

        {/* Create */}
        <button
          type="button"
          data-ocid="nav.create.button"
          onClick={onCreatePost}
          className="flex items-center gap-4 px-3 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          <PlusSquare className="h-6 w-6" strokeWidth={1.5} />
          <span className="hidden xl:block text-sm font-normal">Create</span>
        </button>

        {/* Profile */}
        {isLoggedIn && callerPrincipal && (
          <Link
            to="/profile/$userId"
            params={{ userId: callerPrincipal }}
            data-ocid="nav.profile.link"
          >
            <div
              className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-sidebar-accent ${
                isProfileActive ? "font-bold" : ""
              }`}
            >
              <User
                className="h-6 w-6 text-sidebar-foreground"
                strokeWidth={isProfileActive ? 2.5 : 1.5}
              />
              <span
                className={`hidden xl:block text-sm text-sidebar-foreground ${
                  isProfileActive ? "font-bold" : "font-normal"
                }`}
              >
                Profile
              </span>
            </div>
          </Link>
        )}

        {/* Saved */}
        <button
          type="button"
          data-ocid="nav.saved.button"
          onClick={() => navigate({ to: "/saved" })}
          className={`flex items-center gap-4 px-3 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full ${
            isSavedActive ? "font-bold" : ""
          }`}
        >
          <Bookmark
            className="h-6 w-6"
            strokeWidth={isSavedActive ? 2.5 : 1.5}
          />
          <span className="hidden xl:block text-sm font-normal">Saved</span>
        </button>

        {/* Settings */}
        <Link to="/settings" data-ocid="nav.settings.link">
          <div
            className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all hover:bg-sidebar-accent ${
              isSettingsActive ? "font-bold" : ""
            }`}
          >
            <Settings
              className="h-6 w-6 text-sidebar-foreground"
              strokeWidth={isSettingsActive ? 2.5 : 1.5}
            />
            <span
              className={`hidden xl:block text-sm text-sidebar-foreground ${
                isSettingsActive ? "font-bold" : "font-normal"
              }`}
            >
              Settings
            </span>
          </div>
        </Link>
      </nav>

      {/* User footer */}
      <div className="pt-3 border-t border-sidebar-border">
        {isLoggedIn ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={callerProfile?.profilePic?.getDirectURL()} />
              <AvatarFallback className="bg-muted text-xs font-bold">
                {callerProfile?.username?.slice(0, 2).toUpperCase() ||
                  identity.getPrincipal().toString().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 hidden xl:block">
              <p className="text-sm font-semibold text-foreground truncate">
                {callerProfile?.username ||
                  identity.getPrincipal().toString().slice(0, 8)}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {callerProfile?.bio || ""}
              </p>
            </div>
            <button
              type="button"
              data-ocid="nav.logout.button"
              onClick={clear}
              disabled={isLoggingIn}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 hidden xl:block"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
