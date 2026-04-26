import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile;
  error?: string;
  onRetry?: () => void;
}

export default function ProfileHeader({ profile, error, onRetry }: ProfileHeaderProps) {
  if (error) {
    return (
      <div className="flex items-center gap-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3">
        <p className="text-destructive-foreground text-sm flex-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-destructive-foreground underline hover:opacity-80 transition-opacity"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatarUrl}
        alt={profile.login}
        width={64}
        height={64}
        className="rounded-full"
      />
      <div>
        <p className="font-semibold text-lg text-foreground">
          {profile.name ?? profile.login}
        </p>
        <p className="text-muted-foreground text-sm">@{profile.login}</p>
        {profile.bio && (
          <p className="text-muted-foreground/80 text-sm mt-1">{profile.bio}</p>
        )}
      </div>
    </section>
  );
}
