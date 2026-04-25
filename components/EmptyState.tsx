import { FolderPlus } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 px-8 gap-4">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
        <FolderPlus className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-center text-sm text-muted-foreground max-w-sm">
        {message}
      </p>
    </div>
  );
}
