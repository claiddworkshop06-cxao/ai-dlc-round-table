import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScannerView } from "@/components/equipment/ScannerView";

export default function ScanPage() {
  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Link
            href="/equipment"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← 備品一覧へ
          </Link>
          <h1 className="text-2xl font-bold mt-2">QRコードをスキャン</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">カメラでスキャン</CardTitle>
          </CardHeader>
          <CardContent>
            <ScannerView />
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground text-center">
          スマートフォンのカメラアプリで直接スキャンすることもできます。
        </p>
      </div>
    </div>
  );
}
