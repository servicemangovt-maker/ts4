import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Film, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface Story {
  id: string;
  username: string;
  avatarInitials: string;
  gradient: string;
  mediaUrl: string;
  isVideo: boolean;
  caption: string;
  timestamp: number;
}

interface CreateStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoryCreated: (story: Story) => void;
}

export function CreateStoryModal({
  open,
  onOpenChange,
  onStoryCreated,
}: CreateStoryModalProps) {
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    const videoType = file.type.startsWith("video/");
    setIsVideo(videoType);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  }

  function handleSubmit() {
    if (!previewUrl) {
      toast.error("Please select a photo or video");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const story: Story = {
        id: `story-${Date.now()}`,
        username: "you",
        avatarInitials: "YO",
        gradient: "from-teal to-purple",
        mediaUrl: previewUrl,
        isVideo,
        caption: caption.trim(),
        timestamp: Date.now(),
      };
      onStoryCreated(story);
      toast.success("Story shared! ✨");
      onOpenChange(false);
      setCaption("");
      setPreviewUrl(null);
      setIsVideo(false);
      setIsSubmitting(false);
    }, 600);
  }

  function handleClose() {
    onOpenChange(false);
    setCaption("");
    setPreviewUrl(null);
    setIsVideo(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="create_story.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-base font-semibold border-b border-border pb-3">
            Create Story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="story-media-upload"
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            <label
              data-ocid="create_story.dropzone"
              htmlFor="story-media-upload"
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-10 cursor-pointer hover:border-teal/50 transition-colors bg-muted/30 block"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex gap-2 mb-3">
                <ImagePlus className="h-9 w-9 text-muted-foreground" />
                <Film className="h-9 w-9 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium text-sm">
                Upload photo or video
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Stories disappear after 24h
              </p>
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {isVideo ? (
                <video
                  src={previewUrl}
                  className="w-full object-cover rounded-xl max-h-64"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Story preview"
                  className="w-full object-cover rounded-xl max-h-64"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setIsVideo(false);
                }}
                className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <Textarea
              data-ocid="create_story.textarea"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)..."
              className="bg-muted border-border text-foreground resize-none min-h-[70px]"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              data-ocid="create_story.cancel_button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              data-ocid="create_story.submit_button"
              onClick={handleSubmit}
              disabled={isSubmitting || !previewUrl}
              className="flex-1 bg-gradient-to-r from-teal to-purple text-white hover:opacity-80 font-semibold border-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sharing...
                </>
              ) : (
                "Share Story"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
