import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Heart, Radio, Send, Video, VideoOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { UserProfileDTO } from "../backend";

interface LivePageProps {
  callerProfile: UserProfileDTO | null;
}

const FAKE_COMMENTS = [
  { user: "@star_fan", text: "Kya baat hai! 🔥" },
  { user: "@cool_vibes", text: "Live aa gaye! ❤️" },
  { user: "@ts4_lover", text: "Best live ever 🌟" },
  { user: "@night_owl99", text: "Hello hello 👋" },
  { user: "@musicfan", text: "Suno suno! Amazing 😍" },
  { user: "@desi_beats", text: "Mashallah 💫" },
  { user: "@royal_pk", text: "Welcome to live! 🎉" },
  { user: "@zara_k", text: "Finally live! ❤️❤️" },
];

export function LivePage({ callerProfile }: LivePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLive, setIsLive] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [viewers] = useState(Math.floor(Math.random() * 900) + 100);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<
    { user: string; text: string; id: number }[]
  >([]);
  const [inputMsg, setInputMsg] = useState("");
  const [error, setError] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentIdRef = useRef(0);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        const random =
          FAKE_COMMENTS[Math.floor(Math.random() * FAKE_COMMENTS.length)];
        commentIdRef.current += 1;
        setComments((prev) => [
          ...prev.slice(-30),
          { ...random, id: commentIdRef.current },
        ]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const startLive = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLive(true);
      setError("");
    } catch {
      setError("Camera ya microphone allow karein browser mein.");
    }
  };

  const stopLive = () => {
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
    }
    setStream(null);
    setIsLive(false);
    setComments([]);
    setLikes(0);
  };

  const toggleCamera = () => {
    if (stream) {
      for (const t of stream.getVideoTracks()) {
        t.enabled = !t.enabled;
      }
      setCameraOn((prev) => !prev);
    }
  };

  const sendComment = () => {
    if (!inputMsg.trim()) return;
    commentIdRef.current += 1;
    setComments((prev) => [
      ...prev.slice(-30),
      {
        user: callerProfile?.username ? `@${callerProfile.username}` : "@you",
        text: inputMsg.trim(),
        id: commentIdRef.current,
      },
    ]);
    setInputMsg("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!isLive ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center">
            <Radio className="w-12 h-12 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Go Live</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Apna live stream shuru karein -- aapke followers dekh sakte hain!
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}
          <Button
            onClick={startLive}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold gap-2"
          >
            <Video className="w-5 h-5" />
            Live Shuru Karein
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[75vh]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${!cameraOn ? "opacity-0" : ""}`}
            />
            {!cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}

            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white border-0 text-xs font-bold px-2 animate-pulse">
                  🔴 LIVE
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  <Eye className="w-3 h-3" /> {viewers.toLocaleString()}
                </Badge>
              </div>
              <button
                type="button"
                onClick={stopLive}
                className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-20 left-4 flex items-center gap-2">
              <Avatar className="w-8 h-8 ring-2 ring-white">
                <AvatarFallback className="bg-teal text-background text-xs font-bold">
                  {callerProfile?.username?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-semibold drop-shadow">
                {callerProfile?.username || "Aap"}
              </span>
            </div>

            <div className="absolute bottom-16 left-4 right-4 max-h-40 overflow-y-auto flex flex-col gap-1 no-scrollbar">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-1.5">
                  <span className="text-teal text-xs font-semibold whitespace-nowrap">
                    {c.user}
                  </span>
                  <span className="text-white text-xs">{c.text}</span>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
              <Input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendComment()}
                placeholder="Comment karein..."
                className="flex-1 h-9 bg-black/50 border-white/20 text-white placeholder:text-white/50 text-sm rounded-full"
              />
              <button
                type="button"
                onClick={sendComment}
                className="w-9 h-9 rounded-full bg-teal flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-background" />
              </button>
              <button
                type="button"
                onClick={() => setLikes((l) => l + 1)}
                className="w-9 h-9 rounded-full bg-black/50 flex flex-col items-center justify-center gap-0"
              >
                <Heart
                  className={`w-4 h-4 ${likes > 0 ? "text-red-400 fill-red-400" : "text-white"}`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> {viewers.toLocaleString()} viewers
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" /> {likes}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCamera}
                className="rounded-full"
              >
                {cameraOn ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
                {cameraOn ? "Camera Off" : "Camera On"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={stopLive}
                className="rounded-full"
              >
                Live Band Karein
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
