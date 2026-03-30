import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfileDTO } from "../backend";
import { ExternalBlob } from "../backend";
import { useSaveProfile } from "../hooks/useQueries";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: UserProfileDTO | null;
}

export function EditProfileModal({
  open,
  onOpenChange,
  currentProfile,
}: EditProfileModalProps) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [picBytes, setPicBytes] = useState<Uint8Array | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [picLoading, setPicLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveProfile = useSaveProfile();

  // Reset form every time modal opens
  useEffect(() => {
    if (open && currentProfile) {
      setUsername(currentProfile.username || "");
      setBio(currentProfile.bio || "");
      setPicBytes(null);
      setPicPreview(null);
    }
  }, [open, currentProfile]);

  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setPicLoading(true);
    const preview = URL.createObjectURL(file);
    setPicPreview(preview);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      if (buf) {
        setPicBytes(new Uint8Array(buf));
      }
      setPicLoading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image");
      setPicLoading(false);
    };
    reader.readAsArrayBuffer(file);
  }

  function handleSave() {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    let profilePic: ExternalBlob | undefined;
    if (picBytes) {
      profilePic = ExternalBlob.fromBytes(
        picBytes as unknown as Uint8Array<ArrayBuffer>,
      );
    } else {
      profilePic = currentProfile?.profilePic ?? undefined;
    }

    const profile: UserProfileDTO = {
      username: username.trim(),
      bio: bio.trim(),
      notifications: currentProfile?.notifications || [],
      followers: currentProfile?.followers || [],
      following: currentProfile?.following || [],
      profilePic,
    };

    saveProfile.mutate(profile, {
      onSuccess: () => {
        toast.success("Profile saved!");
        onOpenChange(false);
      },
      onError: (err) => {
        console.error("Save profile error:", err);
        toast.error("Failed to save profile. Please try again.");
      },
    });
  }

  function triggerFilePicker() {
    if (!picLoading) fileRef.current?.click();
  }

  const avatarSrc = picPreview || currentProfile?.profilePic?.getDirectURL();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="edit_profile.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Avatar upload - entire area clickable */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              data-ocid="edit_profile.upload_button"
              className="relative cursor-pointer group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              onClick={triggerFilePicker}
              title="Click to change profile photo"
              disabled={picLoading}
            >
              <Avatar className="w-20 h-20 ring-2 ring-teal/40">
                <AvatarImage src={avatarSrc} />
                <AvatarFallback className="bg-muted text-lg font-bold">
                  {username?.slice(0, 1).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {picLoading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            </button>
            <p className="text-xs text-muted-foreground">Tap photo to change</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePicChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Username
            </Label>
            <Input
              data-ocid="edit_profile.input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Bio
            </Label>
            <Textarea
              data-ocid="edit_profile.textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself..."
              className="bg-muted border-border text-foreground resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              data-ocid="edit_profile.cancel_button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              data-ocid="edit_profile.save_button"
              onClick={handleSave}
              disabled={saveProfile.isPending || picLoading}
              className="flex-1 bg-teal text-background hover:opacity-80 font-semibold"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
