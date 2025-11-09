"use client";

import { LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import type { UserData } from "@/types/navigation";

interface UserSectionProps {
  user?: UserData | null;
  onSignIn?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function UserSection({
  user,
  onSignIn,
  onProfileClick,
  onLogout,
}: UserSectionProps) {
  if (!user) {
    return (
      <div className="mt-1">
        <button
          onClick={onSignIn}
          className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 transition-all shadow-sm"
          aria-label="Sign in to your account"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm font-medium">Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mt-1 space-y-2">
      <button
        onClick={onProfileClick}
        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-foreground/5 active:bg-foreground/10 transition-all"
        aria-label={`View profile for ${user.name}`}
      >
        {user.image ? (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user.image}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
            <User className="w-5 h-5 text-foreground/60" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground/90">{user.name}</p>
          <p className="text-xs text-foreground/60">{user.email}</p>
        </div>
      </button>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 active:bg-destructive/30 transition-all"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">Sign Out</span>
      </button>
    </div>
  );
}
