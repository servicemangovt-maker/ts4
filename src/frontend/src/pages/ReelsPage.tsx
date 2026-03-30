import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Play,
  Plus,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAllPosts } from "../hooks/useQueries";

interface Reel {
  id: string;
  videoUrl: string;
  username: string;
  caption: string;
  music: string;
  likes: string;
  comments: string;
  avatarColor: string;
}

const AVATAR_COLORS = [
  "#e91e8c",
  "#7c3aed",
  "#ea580c",
  "#059669",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#10b981",
];

function getAvatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const SAMPLE_REELS: Reel[] = [
  {
    id: "s1",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "@ts4_vibes",
    caption: "Amazing video! 🔥 #ts4 #reels #trending",
    music: "Original Audio – ts4_vibes",
    likes: "12.4K",
    comments: "234",
    avatarColor: "#e91e8c",
  },
  {
    id: "s2",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "@dream_weaver",
    caption: "Watch this dream unfold ✨ #viral #art #creative",
    music: "Chill Beats – dream_weaver",
    likes: "8.7K",
    comments: "567",
    avatarColor: "#7c3aed",
  },
  {
    id: "s3",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "@reel_king",
    caption: "Fire content only 🔥🔥 #reels #ts4app #king",
    music: "Blaze Mix – reel_king",
    likes: "23.1K",
    comments: "1.2K",
    avatarColor: "#ea580c",
  },
  {
    id: "s4",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    username: "@escape_vibes",
    caption: "Life is an adventure 🌍 #travel #explore #wanderlust",
    music: "Wanderlust – escape_vibes",
    likes: "5.3K",
    comments: "89",
    avatarColor: "#059669",
  },
  {
    id: "s5",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    username: "@speed_creator",
    caption: "Roads calling 🚗💨 #cars #adventure #speed",
    music: "Road Trip Vibes – speed_creator",
    likes: "31.8K",
    comments: "2.4K",
    avatarColor: "#0ea5e9",
  },
  {
    id: "s6",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "@fun_factory",
    caption: "Having the time of my life 🎉 #fun #reels #party",
    music: "Party Anthem – fun_factory",
    likes: "18.2K",
    comments: "930",
    avatarColor: "#f59e0b",
  },
  {
    id: "s7",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    username: "@joyride_ts4",
    caption: "Best joyride ever 🎢 #joyride #thrill #ts4",
    music: "Thrill Seekers – joyride_ts4",
    likes: "9.6K",
    comments: "412",
    avatarColor: "#ef4444",
  },
  {
    id: "s8",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    username: "@drama_queen99",
    caption: "When Monday hits different 😤 #mood #relatable",
    music: "Dramatic Outro – drama_queen99",
    likes: "44.5K",
    comments: "3.8K",
    avatarColor: "#10b981",
  },
  {
    id: "s9",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    username: "@cinematic_soul",
    caption: "Cinematic vibes only 🎬 #film #cinematic #art",
    music: "Epic Score – cinematic_soul",
    likes: "67.3K",
    comments: "5.1K",
    avatarColor: "#e91e8c",
  },
  {
    id: "s10",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    username: "@steel_vibes",
    caption: "Sometimes strength is all you have 💪 #motivation #steel",
    music: "Power Up – steel_vibes",
    likes: "15.9K",
    comments: "740",
    avatarColor: "#7c3aed",
  },
  {
    id: "s11",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    username: "@car_culture",
    caption: "GTI review dropping! 🚀 #cars #gti #review #auto",
    music: "Engine Roar – car_culture",
    likes: "22.7K",
    comments: "1.9K",
    avatarColor: "#0ea5e9",
  },
  {
    id: "s12",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoing.mp4",
    username: "@ts4_explorer",
    caption: "We are going places 🌟 #explore #ts4 #journey",
    music: "Journey Ahead – ts4_explorer",
    likes: "7.4K",
    comments: "320",
    avatarColor: "#ea580c",
  },
];

function expandReels(base: Reel[], copies: number): Reel[] {
  const result: Reel[] = [];
  for (let c = 0; c < copies; c++) {
    for (const reel of base) {
      result.push({ ...reel, id: `${reel.id}_x${c}` });
    }
  }
  return result;
}

function ReelCard({
  reel,
  isMuted,
  onMuteToggle,
}: {
  reel: Reel;
  isMuted: boolean;
  onMuteToggle: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlay, setShowPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    setShowPlay(true);
    setTimeout(() => setShowPlay(false), 600);
  };

  return (
    <div
      className="relative w-full flex-shrink-0"
      style={{ height: "100dvh", scrollSnapAlign: "start" }}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: video tap-to-play is standard media UX */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
        style={{ cursor: "pointer" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)",
        }}
      />
      {showPlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-5">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
      )}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6">
        <button
          type="button"
          className="flex flex-col items-center gap-1"
          onClick={() => setIsLiked((p) => !p)}
        >
          <Heart
            className={`w-7 h-7 transition-all ${
              isLiked ? "fill-pink-500 text-pink-500 scale-110" : "text-white"
            }`}
          />
          <span className="text-white text-xs font-semibold drop-shadow">
            {reel.likes}
          </span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-semibold drop-shadow">
            {reel.comments}
          </span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1">
          <Share2 className="w-7 h-7 text-white" />
          <span className="text-white text-xs font-semibold drop-shadow">
            Share
          </span>
        </button>
        <button type="button">
          <MoreHorizontal className="w-7 h-7 text-white" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-16 p-4 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-9 h-9 border-2 border-white">
            <AvatarFallback style={{ backgroundColor: reel.avatarColor }}>
              {reel.username.slice(1, 3).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white font-bold text-sm drop-shadow">
            {reel.username}
          </span>
          <button
            type="button"
            className="ml-2 px-3 py-0.5 border border-white rounded-full text-white text-xs font-semibold"
          >
            Follow
          </button>
        </div>
        <p className="text-white text-sm drop-shadow leading-snug mb-2">
          {reel.caption}
        </p>
        <div className="flex items-center gap-1.5">
          <Music2 className="w-3 h-3 text-white" />
          <span className="text-white text-xs">{reel.music}</span>
        </div>
      </div>
      <button
        type="button"
        className="absolute top-4 right-4 bg-black/40 rounded-full p-2"
        onClick={onMuteToggle}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}

export function ReelsPage() {
  const [isMuted, setIsMuted] = useState(true);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [displayedReels, setDisplayedReels] = useState<Reel[]>([]);

  const { data: allPosts } = useAllPosts();

  const backendReels = useMemo<Reel[]>(
    () =>
      (allPosts ?? [])
        .filter((post) => post.hashtags.includes("_media_video"))
        .map((post) => ({
          id: post.id,
          videoUrl: post.image.getDirectURL(),
          username: `@${post.author.toString().slice(0, 8)}`,
          caption: post.caption,
          music: "Original Audio",
          likes: post.likes.length.toString(),
          comments: "0",
          avatarColor: getAvatarColor(post.author.toString()),
        })),
    [allPosts],
  );

  const baseReels = useMemo(
    () => [...userReels, ...backendReels, ...SAMPLE_REELS],
    [userReels, backendReels],
  );

  useEffect(() => {
    if (baseReels.length === 0) return;
    setDisplayedReels(expandReels(baseReels, 50));
  }, [baseReels]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const nearEnd =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      container.clientHeight * 3;
    if (nearEnd) {
      setDisplayedReels((prev) => [...prev, ...expandReels(baseReels, 10)]);
    }
  }, [baseReels]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const videoUrl = URL.createObjectURL(file);
    const newReel: Reel = {
      id: `user-${Date.now()}`,
      videoUrl,
      username: "@you",
      caption: "My Reel 🎬 #ts4 #reels",
      music: "Original Audio – you",
      likes: "0",
      comments: "0",
      avatarColor: "#e91e8c",
    };
    setUserReels((prev) => [newReel, ...prev]);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
    e.target.value = "";
  };

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="fixed inset-0 bg-black overflow-y-scroll"
      style={{
        scrollSnapType: "y mandatory",
        WebkitOverflowScrolling: "touch",
        zIndex: 50,
      }}
      data-ocid="reels.page"
    >
      {displayedReels.map((reel) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted((p) => !p)}
        />
      ))}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleUploadClick}
        data-ocid="reels.upload_button"
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-full text-white text-sm font-bold shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #e91e8c 0%, #7c3aed 100%)",
          zIndex: 60,
          boxShadow: "0 4px 24px rgba(233,30,140,0.5)",
        }}
      >
        <Plus className="w-5 h-5" />
        Upload Reel
      </button>
    </div>
  );
}
