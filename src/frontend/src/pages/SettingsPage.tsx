import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { EditProfileModal } from "../components/EditProfileModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

function getBoolPref(key: string, def: boolean): boolean {
  const val = localStorage.getItem(key);
  return val === null ? def : val === "true";
}

export function SettingsPage() {
  const { clear } = useInternetIdentity();
  const { data: callerProfile } = useCallerProfile();
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [pushNotifs, setPushNotifs] = useState(() =>
    getBoolPref("ts4_push_notifs", true),
  );
  const [emailNotifs, setEmailNotifs] = useState(() =>
    getBoolPref("ts4_email_notifs", false),
  );
  const [privateAccount, setPrivateAccount] = useState(() =>
    getBoolPref("ts4_private_account", false),
  );

  function togglePush(val: boolean) {
    setPushNotifs(val);
    localStorage.setItem("ts4_push_notifs", String(val));
  }
  function toggleEmail(val: boolean) {
    setEmailNotifs(val);
    localStorage.setItem("ts4_email_notifs", String(val));
  }
  function togglePrivate(val: boolean) {
    setPrivateAccount(val);
    localStorage.setItem("ts4_private_account", String(val));
  }

  const username = callerProfile?.username || "User";
  const avatarSrc = callerProfile?.profilePic?.getDirectURL();

  return (
    <div className="max-w-lg mx-auto py-6 px-4 space-y-6">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      {/* Profile section */}
      <section data-ocid="settings.panel">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Profile
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-4 p-4">
            <Avatar className="w-14 h-14 ring-2 ring-border">
              <AvatarImage src={avatarSrc} />
              <AvatarFallback className="bg-muted text-lg font-bold">
                {username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{username}</p>
              <p className="text-sm text-muted-foreground truncate">
                {callerProfile?.bio || "No bio yet"}
              </p>
            </div>
          </div>
          <Separator className="bg-border" />
          <button
            type="button"
            data-ocid="settings.edit_profile.button"
            onClick={() => setEditProfileOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Edit Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </section>

      {/* Notifications section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Notifications
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Push notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified about activity
                </p>
              </div>
            </div>
            <Switch
              data-ocid="settings.push_notifs.switch"
              checked={pushNotifs}
              onCheckedChange={togglePush}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Email notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
            </div>
            <Switch
              data-ocid="settings.email_notifs.switch"
              checked={emailNotifs}
              onCheckedChange={toggleEmail}
            />
          </div>
        </div>
      </section>

      {/* Privacy section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Privacy
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Private account</p>
                <p className="text-xs text-muted-foreground">
                  Only followers can see your posts
                </p>
              </div>
            </div>
            <Switch
              data-ocid="settings.private_account.switch"
              checked={privateAccount}
              onCheckedChange={togglePrivate}
            />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">Account security</p>
                <p className="text-xs text-muted-foreground">
                  Secured by Internet Identity
                </p>
              </div>
            </div>
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
        </div>
      </section>

      {/* Account section */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Account
        </h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3">
            <p className="text-sm text-muted-foreground">Joined ts4</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">
              Secured on the Internet Computer blockchain
            </p>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">
          Danger Zone
        </h2>
        <div className="bg-card border border-destructive/30 rounded-2xl overflow-hidden">
          <Button
            data-ocid="settings.logout.button"
            variant="ghost"
            onClick={clear}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 h-auto text-destructive hover:bg-destructive/10 hover:text-destructive rounded-none"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </Button>
        </div>
      </section>

      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentProfile={callerProfile || null}
      />

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        © {new Date().getFullYear()} ts4. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
