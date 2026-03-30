import {
  ArrowLeft,
  Camera,
  FlipHorizontal,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type CallType = "audio" | "video";
type CallStatus = "missed" | "received" | "outgoing";

interface CallEntry {
  id: number;
  username: string;
  initials: string;
  gradient: string;
  type: CallType;
  status: CallStatus;
  timeAgo: string;
}

const sampleCalls: CallEntry[] = [
  {
    id: 1,
    username: "alex_photo",
    initials: "AP",
    gradient: "from-purple-500 to-pink-500",
    type: "video",
    status: "missed",
    timeAgo: "2 min ago",
  },
  {
    id: 2,
    username: "sara_vibes",
    initials: "SV",
    gradient: "from-blue-500 to-cyan-400",
    type: "audio",
    status: "received",
    timeAgo: "1 hr ago",
  },
  {
    id: 3,
    username: "raza_creativee",
    initials: "RC",
    gradient: "from-orange-500 to-yellow-400",
    type: "video",
    status: "outgoing",
    timeAgo: "3 hr ago",
  },
  {
    id: 4,
    username: "nadia_arts",
    initials: "NA",
    gradient: "from-green-500 to-teal-400",
    type: "audio",
    status: "missed",
    timeAgo: "Yesterday",
  },
  {
    id: 5,
    username: "hamza_official",
    initials: "HO",
    gradient: "from-red-500 to-rose-400",
    type: "video",
    status: "received",
    timeAgo: "Yesterday",
  },
  {
    id: 6,
    username: "zara_glam",
    initials: "ZG",
    gradient: "from-violet-500 to-indigo-500",
    type: "audio",
    status: "outgoing",
    timeAgo: "2 days ago",
  },
];

function StatusIcon({ status, type }: { status: CallStatus; type: CallType }) {
  const Icon =
    status === "missed"
      ? PhoneMissed
      : status === "received"
        ? PhoneIncoming
        : PhoneCall;
  const color = status === "missed" ? "text-red-500" : "text-green-400";
  if (type === "video") {
    return <Video className={`h-4 w-4 ${color}`} />;
  }
  return <Icon className={`h-4 w-4 ${color}`} />;
}

function ActiveCallScreen({
  call,
  onBack,
}: {
  call: CallEntry;
  onBack: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-ocid="calls.dialog"
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button
          type="button"
          data-ocid="calls.close_button"
          onClick={onBack}
          className="text-white p-2 rounded-full hover:bg-white/10 transition"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <p className="text-white font-semibold text-lg leading-tight">
            {call.username}
          </p>
          <p className="text-white/50 text-sm">ts4 call</p>
        </div>
      </div>

      {/* Center avatar with pulsing rings */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
            className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${call.gradient} opacity-30`}
          />
          <motion.div
            animate={{ scale: [1, 1.35], opacity: [0.4, 0] }}
            transition={{
              duration: 1.8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
              delay: 0.4,
            }}
            className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${call.gradient} opacity-20`}
          />
          {/* Avatar */}
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br ${call.gradient} flex items-center justify-center shadow-2xl`}
          >
            <span className="text-white text-4xl font-bold">
              {call.initials}
            </span>
          </div>
        </div>

        <motion.p
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="text-white/70 text-base tracking-widest uppercase text-sm"
        >
          calling...
        </motion.p>
      </div>

      {/* Bottom controls */}
      <div
        className="flex items-center justify-center gap-6 pb-16 px-8"
        data-ocid="calls.panel"
      >
        {/* Mute */}
        <button
          type="button"
          data-ocid="calls.toggle"
          onClick={() => setMuted((m) => !m)}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
            {muted ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6 text-white" />
            )}
          </div>
          <span className="text-white/60 text-xs">
            {muted ? "Unmute" : "Mute"}
          </span>
        </button>

        {/* Flip camera */}
        <button
          type="button"
          data-ocid="calls.secondary_button"
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
            <FlipHorizontal className="h-6 w-6 text-white" />
          </div>
          <span className="text-white/60 text-xs">Flip</span>
        </button>

        {/* Video toggle */}
        <button
          type="button"
          data-ocid="calls.video_toggle"
          onClick={() => setVideoOff((v) => !v)}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition">
            {videoOff ? (
              <VideoOff className="h-6 w-6 text-white" />
            ) : (
              <Video className="h-6 w-6 text-white" />
            )}
          </div>
          <span className="text-white/60 text-xs">
            {videoOff ? "Video off" : "Video"}
          </span>
        </button>

        {/* End call */}
        <button
          type="button"
          data-ocid="calls.delete_button"
          onClick={onBack}
          className="flex flex-col items-center gap-2"
        >
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition shadow-lg">
            <PhoneOff className="h-6 w-6 text-white" />
          </div>
          <span className="text-white/60 text-xs">End</span>
        </button>
      </div>
    </motion.div>
  );
}

export function CallsPage() {
  const [activeCall, setActiveCall] = useState<CallEntry | null>(null);

  return (
    <div className="min-h-screen bg-black text-white" data-ocid="calls.page">
      <AnimatePresence>
        {activeCall && (
          <ActiveCallScreen
            key={activeCall.id}
            call={activeCall}
            onBack={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4 border-b border-white/10">
        <h1 className="text-xl font-bold">Calls</h1>
        <button
          type="button"
          data-ocid="calls.open_modal_button"
          className="text-white/80 hover:text-white transition p-1"
        >
          <Camera className="h-6 w-6" />
        </button>
      </div>

      {/* Link device prompt */}
      <div className="mx-4 mt-4 mb-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
        <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Link your device</p>
          <p className="text-xs text-white/50">
            Make & receive calls on all devices
          </p>
        </div>
      </div>

      {/* Recent label */}
      <p className="px-4 pt-3 pb-1 text-xs text-white/40 font-semibold uppercase tracking-wider">
        Recent
      </p>

      {/* Call list */}
      <ul data-ocid="calls.list">
        {sampleCalls.map((call, idx) => (
          <motion.li
            key={call.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            data-ocid={`calls.item.${idx + 1}`}
          >
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              onClick={() => setActiveCall(call)}
            >
              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${call.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-sm font-bold">
                  {call.initials}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm leading-tight ${
                    call.status === "missed" ? "text-red-400" : "text-white"
                  }`}
                >
                  {call.username}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StatusIcon status={call.status} type={call.type} />
                  <span
                    className={`text-xs ${
                      call.status === "missed"
                        ? "text-red-400"
                        : "text-white/50"
                    }`}
                  >
                    {call.status === "missed"
                      ? "Missed"
                      : call.status === "received"
                        ? "Incoming"
                        : "Outgoing"}{" "}
                    · {call.timeAgo}
                  </span>
                </div>
              </div>

              {/* Call button */}
              <button
                type="button"
                data-ocid={`calls.primary_button.${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCall(call);
                }}
                className="text-blue-400 hover:text-blue-300 transition p-2 rounded-full hover:bg-blue-400/10"
              >
                {call.type === "video" ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <Phone className="h-5 w-5" />
                )}
              </button>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
