import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import {
  Compass,
  Film,
  Home,
  MessageSquare,
  PlusSquare,
  User,
} from "lucide-react";
import { useState } from "react";
import { CreatePostModal } from "./components/CreatePostModal";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { LeftSidebar } from "./components/layout/LeftSidebar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useQueries";
import { CallsPage } from "./pages/CallsPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { LivePage } from "./pages/LivePage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReelsPage } from "./pages/ReelsPage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SetupProfilePage } from "./pages/SetupProfilePage";

function MobileBottomNav({
  callerPrincipal,
  onCreatePost,
}: {
  callerPrincipal: string | null;
  onCreatePost: () => void;
}) {
  const navigate = useNavigate();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around h-12 px-2">
      <button
        type="button"
        data-ocid="mobile.nav.home.button"
        onClick={() => navigate({ to: "/" })}
        className="flex items-center justify-center w-10 h-10"
      >
        <Home className="h-6 w-6 text-foreground" />
      </button>
      <button
        type="button"
        data-ocid="mobile.nav.explore.button"
        onClick={() => navigate({ to: "/explore" })}
        className="flex items-center justify-center w-10 h-10"
      >
        <Compass className="h-6 w-6 text-foreground" />
      </button>
      <button
        type="button"
        data-ocid="mobile.nav.create.button"
        onClick={onCreatePost}
        className="flex items-center justify-center w-10 h-10"
      >
        <PlusSquare className="h-7 w-7 text-foreground" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        data-ocid="mobile.nav.messages.button"
        onClick={() => navigate({ to: "/messages" })}
        className="flex items-center justify-center w-10 h-10"
      >
        <MessageSquare className="h-6 w-6 text-foreground" />
      </button>
      <button
        type="button"
        data-ocid="mobile.nav.reels.button"
        onClick={() => navigate({ to: "/reels" })}
        className="flex items-center justify-center w-10 h-10"
      >
        <Film className="h-6 w-6 text-foreground" />
      </button>
      <button
        type="button"
        data-ocid="mobile.nav.profile.button"
        onClick={() =>
          callerPrincipal
            ? navigate({
                to: "/profile/$userId",
                params: { userId: callerPrincipal },
              })
            : navigate({ to: "/" })
        }
        className="flex items-center justify-center w-10 h-10"
      >
        <User className="h-6 w-6 text-foreground" />
      </button>
    </nav>
  );
}

// ── Root layout ──────────────────────────────────────────────────────────────
function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: callerProfile, isLoading: profileLoading } = useCallerProfile();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileSetupDone, setProfileSetupDone] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <h1
            className="text-4xl font-bold insta-gradient-text"
            style={{ fontFamily: "cursive" }}
          >
            ts4
          </h1>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  const needsSetup =
    !profileLoading &&
    !profileSetupDone &&
    callerProfile !== undefined &&
    (!callerProfile || !callerProfile.username);

  if (needsSetup) {
    return <SetupProfilePage onComplete={() => setProfileSetupDone(true)} />;
  }

  const callerPrincipal = identity?.getPrincipal().toString() || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Left sidebar - desktop only */}
      <LeftSidebar
        callerProfile={callerProfile || null}
        onCreatePost={() => setCreatePostOpen(true)}
        onNotifications={() => setNotificationsOpen(true)}
      />

      {/* Top header - mobile only */}
      <TopHeader
        callerProfile={callerProfile || null}
        onCreatePost={() => setCreatePostOpen(true)}
        onNotifications={() => setNotificationsOpen(true)}
        onMobileMenu={() => {}}
      />

      {/* Main content area */}
      <div className="lg:ml-[68px] xl:ml-[244px] pb-12 lg:pb-0">
        <main className="px-0 lg:px-4 lg:py-6">
          <div className="max-w-5xl mx-auto flex gap-8 justify-center">
            {/* Center feed */}
            <div className="w-full max-w-[470px] min-w-0">
              <Outlet />
            </div>

            {/* Right sidebar */}
            <div className="hidden xl:block flex-shrink-0 pt-2">
              <RightSidebar callerProfile={callerProfile || null} />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav
        callerPrincipal={callerPrincipal}
        onCreatePost={() => setCreatePostOpen(true)}
      />

      {/* Modals */}
      <CreatePostModal open={createPostOpen} onOpenChange={setCreatePostOpen} />
      <NotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />

      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
          },
        }}
      />
    </div>
  );
}

// ── Route definitions ─────────────────────────────────────────────────────────
const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRouteComponent,
});
function HomeRouteComponent() {
  const { data: callerProfile } = useCallerProfile();
  return <HomePage callerProfile={callerProfile || null} />;
}

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExploreRouteComponent,
});
function ExploreRouteComponent() {
  const { data: callerProfile } = useCallerProfile();
  return <ExplorePage callerProfile={callerProfile || null} />;
}

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/$userId",
  component: ProfileRouteComponent,
});
function ProfileRouteComponent() {
  const { data: callerProfile } = useCallerProfile();
  return <ProfilePage callerProfile={callerProfile || null} />;
}

const liveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/live",
  component: LiveRouteComponent,
});
function LiveRouteComponent() {
  const { data: callerProfile } = useCallerProfile();
  return <LivePage callerProfile={callerProfile || null} />;
}

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reels",
  component: ReelsPage,
});

const callsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/calls",
  component: CallsPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const savedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/saved",
  component: SavedRouteComponent,
});
function SavedRouteComponent() {
  const { data: callerProfile } = useCallerProfile();
  return <SavedPage callerProfile={callerProfile || null} />;
}

const routeTree = rootRoute.addChildren([
  homeRoute,
  exploreRoute,
  profileRoute,
  liveRoute,
  reelsRoute,
  callsRoute,
  messagesRoute,
  settingsRoute,
  savedRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
