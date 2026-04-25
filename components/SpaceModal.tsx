"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Space } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SpaceModalProps {
  isOpen: boolean;
  editingSpace: Partial<Space> | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

export default function SpaceModal({
  isOpen,
  editingSpace,
  existingNames,
  onClose,
  onSave,
}: SpaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(editingSpace?.id && editingSpace?.name);

  useEffect(() => {
    if (isOpen && editingSpace) {
      setName(editingSpace.name ?? "");
      setDescription(editingSpace.description ?? "");
      setError(null);
    }
  }, [isOpen, editingSpace]);

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Space name is required.");
      return;
    }

    // Check for duplicate names (excluding current space if editing)
    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === trimmedName.toLowerCase() && n !== editingSpace?.name
    );
    if (isDuplicate) {
      setError(`A space named "${trimmedName}" already exists.`);
      return;
    }

    onSave(trimmedName, description.trim());
    setName("");
    setDescription("");
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-card border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Space" : "New Environment Space"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              Project Context Name
            </label>
            <Input
              id="space-name-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g., Work Main, Side Hustles..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              Focus Statement
            </label>
            <Input
              id="space-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this space..."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive-foreground">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-muted/20 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button id="space-save-btn" onClick={handleSave}>
            {isEditing ? "Save Changes" : "Create Space"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
