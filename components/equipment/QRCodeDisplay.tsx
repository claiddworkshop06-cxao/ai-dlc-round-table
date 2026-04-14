import { headers } from "next/headers";

export async function QRCodeDisplay({ equipmentId }: { equipmentId: number }) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const pageUrl = `${proto}://${host}/equipment/${equipmentId}`;

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-lg border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrApiUrl}
          alt="QR Code"
          width={200}
          height={200}
        />
      </div>
      <p className="text-xs text-muted-foreground break-all text-center max-w-[240px]">
        {pageUrl}
      </p>
    </div>
  );
}
