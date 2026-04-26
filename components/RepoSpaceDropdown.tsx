"use client";

import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Box, Check } from "lucide-react";
import type { Space } from "@/types";
import { Button } from "./ui/button";

interface RepoSpaceDropdownProps {
  repoId: string;
  spaces: Space[];
  onToggle: (repoId: string, spaceId: string) => void;
}

export default function RepoSpaceDropdown({
  repoId,
  spaces,
  onToggle,
}: RepoSpaceDropdownProps) {
  if (spaces.length === 0) return null;

  return (
    <DropdownPrimitive.Root>
      <DropdownPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownPrimitive.Trigger>
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[180px] overflow-hidden rounded-xl border bg-card p-1 shadow-xl animate-fade-in"
        >
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-muted-foreground opacity-60">
            Assign to Space
          </div>
          {spaces.map((space) => {
            const isActive = space.repoIds.includes(repoId);
            return (
              <DropdownPrimitive.Item
                key={space.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onToggle(repoId, space.id);
                }}
                className="flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-accent cursor-pointer outline-none"
              >
                <div className="flex items-center gap-2">
                  <Box
                    className={`w-4 h-4 ${isActive ? "text-primary" : "opacity-40"}`}
                  />
                  <span>{space.name}</span>
                </div>
                {isActive && <Check className="w-3 h-3 text-primary" />}
              </DropdownPrimitive.Item>
            );
          })}
        </DropdownPrimitive.Content>
      </DropdownPrimitive.Portal>
    </DropdownPrimitive.Root>
  );
}
