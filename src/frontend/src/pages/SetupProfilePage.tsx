import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfileDTO } from "../backend";
import { ExternalBlob } from "../backend";
import { useSaveProfile } from "../hooks/useQueries";

interface SetupProfilePageProps {
  onComplete: () => void;
}

export function SetupProfilePage({ onComplete }: SetupProfilePageProps) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [picBytes, setPicBytes] = useState<Uint8Array | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const saveProfile = useSaveProfile();

  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicPreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      setPicBytes(new Uint8Array(buf as ArrayBuffer));
    };
    reader.readAsArrayBuffer(file);
  }

  function handleSave() {
    if (!username.trim()) {
      toast.error("Please choose a username");
      return;
    }
    const profilePic = picBytes
      ? ExternalBlob.fromBytes(picBytes as Uint8Array<ArrayBuffer>)
      : undefined;
    const profile: UserProfileDTO = {
      username: username.trim(),
      bio: bio.trim(),
      notifications: [],
      followers: [],
      following: [],
      profilePic,
    };
    saveProfile.mutate(profile, {
      onSuccess: () => {
        toast.success("Welcome to ts4! 🎉");
        onComplete();
      },
      onError: () => toast.error("Failed to set up profile"),
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-card"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="h-3 w-3" />
            Welcome to ts4!
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Set up your profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Let people know who you are
          </p>
        </div>

        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-2 ring-teal/40">
                <AvatarImage src={picPreview || undefined} />
                <AvatarFallback className="bg-muted text-xl font-bold">
                  {username.slice(0, 1).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                data-ocid="setup.upload_button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-teal rounded-full p-2 hover:opacity-80"
              >
                <Camera className="h-4 w-4 text-background" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Add a profile photo</p>
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
              Username *
            </Label>
            <Input
              data-ocid="setup.input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex_vibes"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Bio
            </Label>
            <Textarea
              data-ocid="setup.textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              className="bg-muted border-border text-foreground resize-none"
              rows={2}
            />
          </div>

          <Button
            data-ocid="setup.submit_button"
            onClick={handleSave}
            disabled={saveProfile.isPending || !username.trim()}
            className="w-full bg-teal text-background hover:opacity-80 font-bold h-11 rounded-xl shadow-glow"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting up...
              </>
            ) : (
              "Start Sharing"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
