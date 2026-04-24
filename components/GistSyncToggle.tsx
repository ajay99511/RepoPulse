"use client";

import { useEffect, useRef, useState } from "react";
import { useRepoPulseStore } from "@/lib/store";
import type { GistConfig } from "@/types";

export default function GistSyncToggle() {
  const gistSyncEnabled = useRepoPulseStore((s) => s.gistSyncEnabled);
  const gistId = useRepoPulseStore((s) => s.gistId);
  const localPaths = useRepoPulseStore((s) => s.localPaths);
  const customGroups = useRepoPulseStore((s) => s.customGroups);
  const hideForks = useRepoPulseStore((s) => s.hideForks);
  const sortOption = useRepoPulseStore((s) => s.sortOption);
  const enableGistSync = useRepoPulseStore((s) => s.enableGistSync);
  const disableGistSync = useRepoPulseStore((s) => s.disableGistSync);

  const [toast, setToast] = useState<string | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleToggle(enabled: boolean) {
    if (!enabled) {
      disableGistSync();
      return;
    }

    // On enable: fetch remote config and merge
    try {
      const params = gistId ? `?gistId=${gistId}` : "";
      if (gistId) {
        const res = await fetch(`/api/gist${params}`);
        if (res.ok) {
          const remote: GistConfig = await res.json();
          // Merge: remote customGroups take precedence
          useRepoPulseStore.setState({
            customGroups: remote.customGroups,
            localPaths: remote.localPaths,
            hideForks: remote.hideForks,
            sortOption: remote.sortOption,
          });
        }
      }
      enableGistSync(gistId);
    } catch {
      showToast("Gist sync unavailable. Operating with local data.");
      enableGistSync(gistId);
    }
  }

  // Sync on store changes when enabled
  useEffect(() => {
    if (!gistSyncEnabled) return;

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      const config: GistConfig = { localPaths, customGroups, hideForks, sortOption };
      try {
        const res = await fetch("/api/gist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gistId, config }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.gistId && data.gistId !== gistId) {
            enableGistSync(data.gistId);
          }
        } else {
          showToast("Gist sync failed. Changes saved locally.");
        }
      } catch {
        showToast("Gist sync unavailable. Changes saved locally.");
      }
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gistSyncEnabled, localPaths, customGroups, hideForks, sortOption]);

  return (
    <div className="relative">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={gistSyncEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 accent-blue-500"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">Gist Sync</span>
      </label>

      {/* Non-blocking toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-yellow-600/40 bg-yellow-900/80 px-4 py-2 text-sm text-yellow-300 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
