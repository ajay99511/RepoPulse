"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  );
}
