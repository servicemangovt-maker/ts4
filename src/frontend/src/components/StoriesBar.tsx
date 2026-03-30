import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateStoryModal, type Story } from "./CreateStoryModal";
import { StoryViewer, type ViewableStory } from "./StoryViewer";

const MOCK_STORIES: ViewableStory[] = [
  {
    id: "mock-1",
    username: "alex_v",
    avatarInitials: "AL",
    gradient: "from-yellow-400 via-red-500 to-pink-500",
    isMock: true,
    mockGradient: "from-yellow-400 via-red-500 to-pink-500",
  },
  {
    id: "mock-2",
    username: "mia.shots",
    avatarInitials: "MI",
    gradient: "from-purple-500 via-pink-500 to-red-400",
    isMock: true,
    mockGradient: "from-purple-500 via-pink-500 to-red-400",
  },
  {
    id: "mock-3",
    username: "rio_dev",
    avatarInitials: "RI",
    gradient: "from-orange-400 via-pink-500 to-purple-600",
    isMock: true,
    mockGradient: "from-orange-400 via-pink-500 to-purple-600",
  },
  {
    id: "mock-4",
    username: "luna_k",
    avatarInitials: "LU",
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    isMock: true,
    mockGradient: "from-yellow-500 via-orange-500 to-red-500",
  },
  {
    id: "mock-5",
    username: "sam.art",
    avatarInitials: "SA",
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    isMock: true,
    mockGradient: "from-pink-500 via-red-500 to-yellow-500",
  },
  {
    id: "mock-6",
    username: "priya.v",
    avatarInitials: "PR",
    gradient: "from-fuchsia-600 via-pink-500 to-orange-400",
    isMock: true,
    mockGradient: "from-fuchsia-600 via-pink-500 to-orange-400",
  },
  {
    id: "mock-7",
    username: "max_w",
    avatarInitials: "MA",
    gradient: "from-violet-600 via-purple-500 to-pink-500",
    isMock: true,
    mockGradient: "from-violet-600 via-purple-500 to-pink-500",
  },
  {
    id: "mock-8",
    username: "aria",
    avatarInitials: "AR",
    gradient: "from-blue-500 via-purple-600 to-pink-500",
    isMock: true,
    mockGradient: "from-blue-500 via-purple-600 to-pink-500",
  },
];

function storyToViewable(s: Story): ViewableStory {
  return {
    id: s.id,
    username: s.username,
    avatarInitials: s.avatarInitials,
    gradient: s.gradient,
    mediaUrl: s.mediaUrl,
    isVideo: s.isVideo,
    caption: s.caption,
    isMock: false,
  };
}

export function StoriesBar() {
  const [createOpen, setCreateOpen] = useState(false);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const allViewable: ViewableStory[] = [
    ...userStories.map(storyToViewable),
    ...MOCK_STORIES,
  ];

  function openViewer(idx: number) {
    setViewerIndex(idx);
  }

  function handleStoryCreated(story: Story) {
    setUserStories((prev) => [story, ...prev]);
  }

  return (
    <>
      <div className="border-b border-border">
        <div
          className="flex gap-4 overflow-x-auto py-4 px-3 scrollbar-none"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Add story */}
          <button
            type="button"
            data-ocid="story.open_modal_button"
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            <div className="relative">
              <Avatar className="w-[62px] h-[62px] ring-1 ring-border">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  You
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0095f6] border-2 border-background flex items-center justify-center">
                <Plus className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs text-foreground whitespace-nowrap">
              Your story
            </span>
          </button>

          {/* User uploaded stories */}
          {userStories.map((story, i) => (
            <button
              key={story.id}
              type="button"
              data-ocid={`story.item.${i + 1}`}
              onClick={() => openViewer(i)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <div
                className={`p-[2px] rounded-full bg-gradient-to-tr ${story.gradient}`}
              >
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-[58px] h-[58px]">
                    {story.mediaUrl && !story.isVideo && (
                      <img
                        src={story.mediaUrl}
                        alt={story.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {story.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-foreground whitespace-nowrap max-w-[64px] truncate">
                Your story
              </span>
            </button>
          ))}

          {/* Mock stories */}
          {MOCK_STORIES.map((story, i) => (
            <button
              key={story.id}
              type="button"
              data-ocid={`story.item.${userStories.length + i + 1}`}
              onClick={() => openViewer(userStories.length + i)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <div
                className={`p-[2px] rounded-full bg-gradient-to-tr ${story.gradient}`}
              >
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-[58px] h-[58px]">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {story.avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap max-w-[64px] truncate">
                {story.username}
              </span>
            </button>
          ))}
        </div>
      </div>

      <CreateStoryModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onStoryCreated={handleStoryCreated}
      />

      {viewerIndex !== null && (
        <StoryViewer
          stories={allViewable}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </>
  );
}
