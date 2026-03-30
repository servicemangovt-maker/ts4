import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Edit,
  Heart,
  Info,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  liked?: boolean;
}

interface Conversation {
  id: number;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

const sampleConversations: Conversation[] = [
  {
    id: 1,
    name: "Aria Khan",
    username: "aria.khan",
    avatar: "",
    lastMessage: "Wow that's amazing! 🔥",
    time: "2m",
    unread: 3,
    online: true,
    messages: [
      { id: 1, text: "Hey! How are you?", fromMe: false, time: "10:00 AM" },
      {
        id: 2,
        text: "I'm good! Just chilling. You?",
        fromMe: true,
        time: "10:01 AM",
      },
      {
        id: 3,
        text: "Same! Did you see that new reel?",
        fromMe: false,
        time: "10:02 AM",
      },
      {
        id: 4,
        text: "Yes!! It was hilarious 😂",
        fromMe: true,
        time: "10:03 AM",
      },
      {
        id: 5,
        text: "Wow that's amazing! 🔥",
        fromMe: false,
        time: "10:04 AM",
      },
    ],
  },
  {
    id: 2,
    name: "Zara Ahmed",
    username: "zara.ahmed",
    avatar: "",
    lastMessage: "Send me the link please",
    time: "15m",
    unread: 1,
    online: true,
    messages: [
      { id: 1, text: "Hey, saw your story!", fromMe: false, time: "9:45 AM" },
      { id: 2, text: "Which one? 😄", fromMe: true, time: "9:46 AM" },
      { id: 3, text: "The sunset one!", fromMe: false, time: "9:47 AM" },
      {
        id: 4,
        text: "Send me the link please",
        fromMe: false,
        time: "9:50 AM",
      },
    ],
  },
  {
    id: 3,
    name: "Bilal Hassan",
    username: "bilal.hassan",
    avatar: "",
    lastMessage: "You: 👍",
    time: "1h",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        text: "Bhai kya chal raha hai?",
        fromMe: false,
        time: "8:00 AM",
      },
      { id: 2, text: "Sab theek! Tu bata?", fromMe: true, time: "8:05 AM" },
      { id: 3, text: "👍", fromMe: true, time: "8:10 AM" },
    ],
  },
  {
    id: 4,
    name: "Sara Ali",
    username: "sara.ali",
    avatar: "",
    lastMessage: "See you tomorrow!",
    time: "3h",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Are you coming?", fromMe: false, time: "6:00 AM" },
      { id: 2, text: "Yes of course!", fromMe: true, time: "6:10 AM" },
      { id: 3, text: "See you tomorrow!", fromMe: false, time: "6:12 AM" },
    ],
  },
  {
    id: 5,
    name: "Usman Raja",
    username: "usman.raja",
    avatar: "",
    lastMessage: "Liked a photo",
    time: "1d",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Liked a photo", fromMe: false, time: "Yesterday" },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "from-pink-500 to-purple-600",
    "from-orange-400 to-pink-500",
    "from-blue-500 to-cyan-400",
    "from-green-400 to-teal-500",
    "from-violet-500 to-indigo-600",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function MessagesPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(sampleConversations);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !selected) return;
    const newMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = conversations.map((c) =>
      c.id === selected.id
        ? {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: `You: ${input.trim()}`,
          }
        : c,
    );
    setConversations(updated);
    setSelected({ ...selected, messages: [...selected.messages, newMsg] });
    setInput("");
  };

  const toggleLike = (msgId: number) => {
    if (!selected) return;
    const updMsgs = selected.messages.map((m) =>
      m.id === msgId ? { ...m, liked: !m.liked } : m,
    );
    const updated = conversations.map((c) =>
      c.id === selected.id ? { ...c, messages: updMsgs } : c,
    );
    setConversations(updated);
    setSelected({ ...selected, messages: updMsgs });
  };

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()),
  );

  // Mobile: show chat if selected, else list
  const isMobileChat = selected !== null;

  return (
    <div className="flex h-[calc(100vh-48px)] lg:h-[calc(100vh-0px)] w-full max-w-[935px] mx-auto border-x border-border bg-background">
      {/* Conversations list */}
      <div
        className={`${
          isMobileChat ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-[340px] border-r border-border flex-shrink-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <span className="font-bold text-base text-foreground">Messages</span>
          <button
            type="button"
            className="text-foreground hover:text-muted-foreground"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted border-none text-sm h-8 rounded-full"
          />
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => {
                setSelected(conv);
                setConversations((prev) =>
                  prev.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)),
                );
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors ${
                selected?.id === conv.id ? "bg-muted/60" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(conv.name)} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {getInitials(conv.name)}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm truncate ${
                      conv.unread > 0
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {conv.name}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {conv.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs truncate ${
                      conv.unread > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conv.lastMessage}
                  </span>
                  {conv.unread > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Chat area */}
      {selected ? (
        <div
          className={`${isMobileChat ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button
              type="button"
              className="md:hidden text-foreground mr-1"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarColor(selected.name)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}
            >
              {getInitials(selected.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {selected.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {selected.online ? "Active now" : "Offline"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <button type="button" className="hover:text-muted-foreground">
                <Phone className="h-5 w-5" />
              </button>
              <button type="button" className="hover:text-muted-foreground">
                <Video className="h-5 w-5" />
              </button>
              <button type="button" className="hover:text-muted-foreground">
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="flex flex-col gap-1">
              {selected.messages.map((msg, idx) => {
                const showTime =
                  idx === 0 || selected.messages[idx - 1].fromMe !== msg.fromMe;
                return (
                  <div key={msg.id} className="group">
                    {showTime && (
                      <div className="text-center text-xs text-muted-foreground my-2">
                        {msg.time}
                      </div>
                    )}
                    <div
                      className={`flex items-end gap-2 ${
                        msg.fromMe ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <div className="relative">
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm max-w-[240px] break-words ${
                            msg.fromMe
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        {/* Like button on hover */}
                        <button
                          type="button"
                          onClick={() => toggleLike(msg.id)}
                          className={`absolute -bottom-3 ${
                            msg.fromMe ? "left-0" : "right-0"
                          } opacity-0 group-hover:opacity-100 transition-opacity`}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              msg.liked
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {msg.liked && (
                      <div
                        className={`flex ${
                          msg.fromMe ? "justify-end mr-2" : "justify-start ml-2"
                        } mt-1`}
                      >
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="px-4 py-3 border-t border-border flex items-center gap-2">
            <button
              type="button"
              className="text-foreground hover:text-muted-foreground"
            >
              <Smile className="h-6 w-6" />
            </button>
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Message..."
                className="bg-muted border-none rounded-full pr-10 text-sm"
              />
            </div>
            {input.trim() ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={sendMessage}
                className="text-blue-400 font-semibold hover:text-blue-300 px-2"
              >
                Send
              </Button>
            ) : (
              <button
                type="button"
                className="text-foreground hover:text-muted-foreground"
              >
                <Send className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty state - desktop */
        <div className="hidden md:flex flex-col flex-1 items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center">
            <Send className="h-7 w-7 text-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-lg">
              Your messages
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Send private photos and messages to a friend or group.
            </p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold px-4 py-2">
            Send message
          </Button>
        </div>
      )}
    </div>
  );
}
