"use client";

import React from "react";
import { AddNewsMode } from "@/components/modes/AddNewsMode";
import { TrayContainer, TrayHeader } from "@/components/shared";

export function ReportTray() {
  return (
    <TrayContainer>
      <TrayHeader
        title="Report Issue"
        description="Share safety concerns with the community"
      />
      <AddNewsMode />
    </TrayContainer>
  );
}
