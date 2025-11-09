"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapProvider } from "@/lib/contexts";
import { NavigationBar } from "@/components/navigation/NavigationBar";
import { MobileBottomSheet } from "@/components/MobileBottomSheet";
import { SidebarTray } from "@/components/SidebarTray";
import { NewsTray, ReportTray } from "@/components/trays";
import { MapSearchBar } from "@/components/search/MapSearchBar";
import { NewsMode } from "@/components/modes/NewsMode";
import { AddNewsMode } from "@/components/modes/AddNewsMode";
import { useAuth, formatUser, useNavigationState } from "@/lib/hooks";
import { NAV_BAR_WIDTH } from "@/lib/constants/navigation";
import { ConfirmDialog } from "@/components/ui/dialog";

const MapCanvas = dynamic(
  () =>
    import("@/components/MapCanvas").then((mod) => ({
      default: mod.MapCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    ),
  }
);

const TRAY_CONFIG = [
  { id: "news", title: "News & Alerts", component: NewsTray },
  { id: "report", title: "Report Issue", component: ReportTray },
] as const;

function MapPageContent() {
  const { user, signIn, signOut } = useAuth();
  const {
    activeTray,
    navBarExpanded,
    toggleTray,
    closeTray,
    setNavBarExpanded,
  } = useNavigationState();
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const formattedUser = formatUser(user);
  const navBarWidth = navBarExpanded
    ? NAV_BAR_WIDTH.EXPANDED
    : NAV_BAR_WIDTH.COLLAPSED;

  // Calculate search box left offset based on nav + tray
  const TRAY_WIDTH = 400;
  const searchBoxLeft = activeTray
    ? navBarWidth + TRAY_WIDTH + 16 // 16px gap from tray (matches map controls)
    : navBarWidth + 16; // 16px gap from nav (matches map controls)

  const handleProfileClick = () => {
    // Profile modal implementation pending
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    await signOut();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NavigationBar
        onItemClick={toggleTray}
        user={formattedUser}
        onSignIn={signIn}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onExpandChange={setNavBarExpanded}
      />

      {TRAY_CONFIG.map(({ id, title, component: Component }) => (
        <SidebarTray
          key={id}
          isOpen={activeTray === id}
          onClose={closeTray}
          title={title}
          leftOffset={navBarWidth}
        >
          <Component />
        </SidebarTray>
      ))}

      <MobileBottomSheet
        searchContent={<MapSearchBar className="w-full" />}
        newsContent={<NewsMode />}
        reportContent={<AddNewsMode />}
        user={formattedUser}
        onSignIn={signIn}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onExpandedChange={setIsMobileNavExpanded}
      />

      <div className="absolute inset-0">
        <MapCanvas hideMobileControls={isMobileNavExpanded} />
      </div>

      <div
        className="hidden lg:block absolute top-4 right-4 z-30 max-w-md pointer-events-none transition-all duration-300"
        style={{ left: `${searchBoxLeft}px` }}
      >
        <div className="pointer-events-auto">
          <MapSearchBar className="w-full" />
        </div>
      </div>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Confirm Logout"
        description="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default function Home() {
  return (
    <MapProvider>
      <MapPageContent />
    </MapProvider>
  );
}
