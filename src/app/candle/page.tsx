"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CandleSanctuaryModal from "../../components/CandleSanctuaryModal";

export default function CandlePage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <CandleSanctuaryModal isOpen={isOpen} onClose={handleClose} />
    </main>
  );
}
