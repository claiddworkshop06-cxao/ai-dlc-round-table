"use client";

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";

export function QRCodeDisplay({ equipmentId }: { equipmentId: number }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/equipment/${equipmentId}`);
  }, [equipmentId]);

  if (!url) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-lg border border-border">
        <QRCode value={url} size={200} />
      </div>
      <p className="text-xs text-muted-foreground break-all text-center max-w-[240px]">
        {url}
      </p>
    </div>
  );
}
