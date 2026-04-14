"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ScannerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    let stream: MediaStream | null = null;
    let animationId: number | null = null;
    let running = true;

    async function startScanner() {
      try {
        if (!("BarcodeDetector" in window)) {
          setError(
            "このブラウザはQRスキャンに対応していません。\nスマートフォンのカメラアプリで直接スキャンしてください。"
          );
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current && running) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code"],
        });

        const scan = async () => {
          if (!running) return;
          if (
            videoRef.current &&
            videoRef.current.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
          ) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const text = barcodes[0].rawValue as string;
                stream?.getTracks().forEach((t) => t.stop());
                running = false;
                setActive(false);
                try {
                  const url = new URL(text);
                  const match = url.pathname.match(/\/equipment\/(\d+)/);
                  if (match) {
                    router.push(`/equipment/${match[1]}`);
                    return;
                  }
                } catch {
                  // not a URL
                }
                setError(
                  `QRコードを読み取りましたが、備品コードではありません。\n内容: ${text}`
                );
                return;
              }
            } catch {
              // ignore detection frame errors
            }
          }
          if (running) {
            animationId = requestAnimationFrame(scan);
          }
        };

        animationId = requestAnimationFrame(scan);
      } catch {
        setError(
          "カメラへのアクセスができません。ブラウザの設定を確認してください。"
        );
      }
    }

    startScanner();

    return () => {
      running = false;
      stream?.getTracks().forEach((t) => t.stop());
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [router, active]);

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            setActive(true);
          }}
        >
          もう一度試す
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        playsInline
        muted
        className="w-full rounded-lg border border-border"
      />
      <p className="text-sm text-muted-foreground text-center">
        備品のQRコードをカメラにかざしてください
      </p>
    </div>
  );
}
