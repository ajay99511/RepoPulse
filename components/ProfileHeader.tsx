import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile;
  error?: string;
  onRetry?: () => void;
}

export default function ProfileHeader({ profile, error, onRetry }: ProfileHeaderProps) {
  if (error) {
    return (
      <div className="flex items-center gap-4 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
        <p className="text-red-300 text-sm flex-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-red-400 underline hover:text-red-300"
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
        <p className="font-semibold text-lg text-white">
          {profile.name ?? profile.login}
        </p>
        <p className="text-gray-400 text-sm">@{profile.login}</p>
        {profile.bio && (
          <p className="text-gray-300 text-sm mt-1">{profile.bio}</p>
        )}
      </div>
    </section>
  );
}
