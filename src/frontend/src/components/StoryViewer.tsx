import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Story } from "./CreateStoryModal";

export interface ViewableStory {
  id: string;
  username: string;
  avatarInitials: string;
  gradient: string;
  mediaUrl?: string;
  isVideo?: boolean;
  caption?: string;
  isMock?: boolean;
  mockGradient?: string;
}

interface StoryViewerProps {
  stories: ViewableStory[];
  initialIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export function StoryViewer({
  stories,
  initialIndex,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const story = stories[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      if (i < stories.length - 1) return i + 1;
      onClose();
      return i;
    });
    setProgress(0);
  }, [stories.length, onClose]);

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    }
  }

  useEffect(() => {
    if (story?.isVideo) return;
    setProgress(0);
    startTimeRef.current = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        if (progressRef.current) clearInterval(progressRef.current);
        goNext();
      }
    }, 50);
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [story?.isVideo, goNext]);

  function handleAreaClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) goPrev();
    else goNext();
  }

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="story-viewer"
        data-ocid="story_viewer.modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        onClick={handleAreaClick}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goNext();
          if (e.key === "ArrowLeft") goPrev();
          if (e.key === "Escape") onClose();
        }}
        // biome-ignore lint/a11y/useSemanticElements: fullscreen overlay needs div
        role="dialog"
        tabIndex={-1}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-4 right-4 flex gap-1 z-10 pointer-events-none">
          {stories.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header - pointer-events-auto so buttons work, no onClick needed on wrapper */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 pointer-events-none">
            <div
              className={`w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr ${story.gradient}`}
            >
              <div className="w-full h-full rounded-full bg-black/50 p-0.5">
                <Avatar className="w-full h-full">
                  <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                    {story.avatarInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className="text-white font-semibold text-sm drop-shadow">
              {story.username}
            </span>
          </div>
          <button
            type="button"
            data-ocid="story_viewer.close_button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:text-white/70 transition-colors bg-white/10 rounded-full p-1.5 pointer-events-auto"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media - pointer-events-none so area click passes through */}
        <AnimatePresence mode="wait">
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          >
            {story.isMock || !story.mediaUrl ? (
              <div
                className={`w-full max-w-sm h-[70vh] rounded-2xl bg-gradient-to-br ${
                  story.mockGradient || story.gradient
                } flex items-center justify-center`}
              >
                <span className="text-white text-6xl font-bold opacity-30">
                  {story.avatarInitials}
                </span>
              </div>
            ) : story.isVideo ? (
              <video
                src={story.mediaUrl}
                className="max-w-sm w-full max-h-[80vh] object-contain rounded-2xl"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={story.mediaUrl}
                alt={story.caption || story.username}
                className="max-w-sm w-full max-h-[80vh] object-contain rounded-2xl"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-8 left-4 right-4 text-center z-10 pointer-events-none">
            <p className="text-white text-sm drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
              {story.caption}
            </p>
          </div>
        )}

        {/* Prev / Next buttons */}
        {currentIndex > 0 && (
          <button
            type="button"
            data-ocid="story_viewer.pagination_prev"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            type="button"
            data-ocid="story_viewer.pagination_next"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export type { Story };
