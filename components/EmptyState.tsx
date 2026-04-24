interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 py-16 px-8">
      <p className="text-center text-sm text-gray-500">{message}</p>
    </div>
  );
}
