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
import { Film, ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreatePost } from "../hooks/useQueries";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const [caption, setCaption] = useState("");
  const [hashtagInput, setHashtagInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBytes, setImageBytes] = useState<Uint8Array | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  function processFile(file: File) {
    const videoType = file.type.startsWith("video/");
    setIsVideo(videoType);
    setPreviewUrl(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const buf = ev.target?.result as ArrayBuffer;
      setImageBytes(new Uint8Array(buf as ArrayBuffer));
    };
    reader.readAsArrayBuffer(file);
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
    if (!imageBytes) {
      toast.error("Please select a photo or video");
      return;
    }
    if (!caption.trim()) {
      toast.error("Please add a caption");
      return;
    }
    const hashtags = hashtagInput
      .split(",")
      .map((h) => h.trim().replace(/^#/, ""))
      .filter(Boolean);

    if (isVideo) {
      hashtags.push("_media_video");
    }

    createPost.mutate(
      {
        caption: caption.trim(),
        hashtags,
        imageBytes: imageBytes as Uint8Array<ArrayBuffer>,
      },
      {
        onSuccess: () => {
          toast.success("Post created! 🎉");
          onOpenChange(false);
          setCaption("");
          setHashtagInput("");
          setPreviewUrl(null);
          setImageBytes(null);
          setIsVideo(false);
        },
        onError: () => toast.error("Failed to create post"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="create_post.dialog"
        className="bg-card border-border max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-base font-semibold border-b border-border pb-3">
            Create new post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File drop zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            id="post-image-upload"
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            <label
              data-ocid="create_post.dropzone"
              htmlFor="post-image-upload"
              className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-12 cursor-pointer hover:border-teal/50 transition-colors bg-muted/30 block"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex gap-2 mb-3">
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
                <Film className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium text-sm">
                Drag & drop photo or video
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                PNG, JPG, WEBP, MP4, MOV up to 50MB
              </p>
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              {isVideo ? (
                // biome-ignore lint/a11y/useMediaCaption: preview video
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
                  alt="Preview"
                  className="w-full object-cover rounded-xl max-h-64"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setImageBytes(null);
                  setIsVideo(false);
                }}
                className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Caption
            </Label>
            <Textarea
              data-ocid="create_post.textarea"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="bg-muted border-border text-foreground resize-none min-h-[80px]"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              Hashtags
            </Label>
            <Input
              data-ocid="create_post.input"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="travel, food, photography (comma-separated)"
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="create_post.cancel_button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              data-ocid="create_post.submit_button"
              onClick={handleSubmit}
              disabled={createPost.isPending || !imageBytes || !caption.trim()}
              className="flex-1 bg-teal text-background hover:opacity-80 font-semibold"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Posting...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
