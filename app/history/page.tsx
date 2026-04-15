import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loans, equipment } from "@/src/schema";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { db } = await import("@/src/db");

  const history = await db
    .select({
      id: loans.id,
      borrowerName: loans.borrowerName,
      borrowedAt: loans.borrowedAt,
      returnDueAt: loans.returnDueAt,
      returnedAt: loans.returnedAt,
      equipmentId: equipment.id,
      equipmentName: equipment.name,
    })
    .from(loans)
    .innerJoin(equipment, eq(loans.equipmentId, equipment.id))
    .orderBy(desc(loans.borrowedAt));

  const activeCount = history.filter((h) => !h.returnedAt).length;

  return (
    <div className="min-h-full bg-white/30 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">全貸出履歴</h1>
          <span className="text-sm text-muted-foreground">
            {history.length}件（貸出中: {activeCount}件）
          </span>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              貸出履歴はありません。
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">履歴一覧（新しい順）</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {history.map((entry) => {
                  const isActive = !entry.returnedAt;
                  return (
                    <div
                      key={entry.id}
                      className={`px-4 py-3 flex items-start justify-between gap-3 ${
                        isActive ? "bg-orange-50" : ""
                      }`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/equipment/${entry.equipmentId}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {entry.equipmentName}
                          </Link>
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                              貸出中
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          借り手: {entry.borrowerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          貸出: {entry.borrowedAt.toLocaleDateString("ja-JP")}
                          {entry.returnDueAt && (
                            <> ／ 返却予定: {entry.returnDueAt.toLocaleDateString("ja-JP")}</>
                          )}
                          {entry.returnedAt && (
                            <> ／ 返却: {entry.returnedAt.toLocaleDateString("ja-JP")}</>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
