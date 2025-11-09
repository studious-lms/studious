"use client";

import { Button } from "@/components/ui/button";
import { ReactionType, REACTION_EMOJIS, REACTION_LABELS } from "./ReactionButton";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
  currentReaction?: ReactionType | null;
  onSelect: (type: ReactionType) => void;
}

const REACTIONS: ReactionType[] = [
  'THUMBSUP',
  'CELEBRATE',
  'CARE',
  'HEART',
  'IDEA',
  'HAPPY',
];

export function ReactionPicker({
  currentReaction,
  onSelect,
}: ReactionPickerProps) {
  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl",
            "transition-all duration-200 hover:scale-125 hover:bg-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            currentReaction === type && "bg-primary/20 scale-110"
          )}
          title={REACTION_LABELS[type]}
          aria-label={REACTION_LABELS[type]}
        >
          {REACTION_EMOJIS[type]}
        </button>
      ))}
    </div>
  );
}

