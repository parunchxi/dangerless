"use client";

import { useState, useRef, useEffect } from "react";
import { LogIn, User, LogOut } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Z_INDEX } from "@/lib/constants/navigation";
import type { UserData } from "@/types/navigation";

interface NavUserSectionProps {
  user?: UserData | null;
  onSignIn?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  isExpanded: boolean;
}

export function NavUserSection({
  user,
  onSignIn,
  onProfileClick,
  onLogout,
  isExpanded,
}: NavUserSectionProps) {
  const [showLogout, setShowLogout] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [menuPosition, setMenuPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showLogout && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 60; // Approximate height of the logout menu

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setMenuPosition("top");
      } else {
        setMenuPosition("bottom");
      }
    }
  }, [showLogout]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    if (showLogout) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLogout]);
  if (!user) {
    return (
      <div className="relative">
        <button
          onClick={onSignIn}
          onMouseEnter={() => !isExpanded && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={cn(
            "w-full h-10 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300 flex items-center overflow-hidden",
            isExpanded ? "gap-3 px-3 justify-start" : "justify-center"
          )}
          aria-label="Sign in to your account"
        >
          <div className="shrink-0">
            <LogIn className="w-5 h-5 text-foreground/80" aria-hidden="true" />
          </div>
          <span
            className={cn(
              "text-sm text-foreground/80 whitespace-nowrap transition-all duration-300",
              isExpanded
                ? "opacity-100 max-w-xs"
                : "opacity-0 max-w-0 overflow-hidden"
            )}
          >
            Sign In
          </span>
        </button>

        {!isExpanded && showTooltip && (
          <div
            className="absolute left-full ml-4 px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              zIndex: Z_INDEX.TOOLTIP,
              top: "50%",
              transform: "translateY(-50%)",
            }}
            role="tooltip"
          >
            Sign In
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          setShowLogout(!showLogout);
          onProfileClick?.();
        }}
        onMouseEnter={() => !isExpanded && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "w-full h-10 rounded-lg hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300 flex items-center overflow-hidden",
          isExpanded ? "gap-3 px-3 justify-start" : "justify-center"
        )}
        aria-label={`View profile for ${user.name}`}
      >
        <div className="shrink-0">
          {user.image ? (
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={user.image}
                alt=""
                width={24}
                height={24}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <User className="w-5 h-5 text-foreground/80" aria-hidden="true" />
          )}
        </div>
        <span
          className={cn(
            "text-sm text-foreground/80 whitespace-nowrap transition-all duration-300",
            isExpanded
              ? "opacity-100 max-w-xs"
              : "opacity-0 max-w-0 overflow-hidden"
          )}
        >
          {user.name}
        </span>
      </button>

      {!isExpanded && showTooltip && !showLogout && (
        <div
          className="absolute left-full ml-4 px-3 py-2 bg-background/75 backdrop-blur-xl text-foreground/80 text-sm rounded-xl shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            zIndex: Z_INDEX.TOOLTIP,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          role="tooltip"
        >
          {user.name}
        </div>
      )}

      {showLogout && (
        <div
          className={cn(
            "absolute left-full ml-4 bg-background/75 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden",
            menuPosition === "bottom" ? "top-0" : "bottom-0"
          )}
          style={{ zIndex: Z_INDEX.TOOLTIP }}
        >
          <button
            onClick={() => {
              setShowLogout(false);
              onLogout?.();
            }}
            className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-200 text-left"
          >
            <LogOut
              className="w-5 h-5 text-foreground/80 flex-shrink-0"
              aria-hidden="true"
              strokeWidth={2}
            />
            <span className="text-sm text-foreground/80">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
