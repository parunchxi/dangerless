"use client";

import React, { useState } from "react";
import { NewsMode } from "@/components/modes/NewsMode";
import { NewsModal } from "@/components/modes/news_component/NewsModal";
import { TrayContainer, TrayHeader } from "@/components/shared";
import { NewsItem } from "@/components/modes/news_component";

const NewsModeTyped = NewsMode as unknown as React.ComponentType<{
  onItemClick: (item: NewsItem) => void;
}>;

export function NewsTray() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (item: NewsItem) => {
    setSelectedNews(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <TrayContainer>
      <TrayHeader
        title="Safety News"
        description="Latest safety alerts and updates"
      />
      <NewsModeTyped onItemClick={handleOpenModal} />
      <NewsModal open={modalOpen} onClose={handleCloseModal} item={selectedNews} />
    </TrayContainer>
  );
}
