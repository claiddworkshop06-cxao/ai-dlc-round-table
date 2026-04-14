import Link from "next/link";
import { isNull } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { equipment, loans } from "@/src/schema";

export const dynamic = "force-dynamic";

type AlertLevel = "overdue" | "warning" | "normal";

function getAlertLevel(returnDueAt: Date | null): AlertLevel {
  if (!returnDueAt) return "normal";
  const now = new Date();
  const due = new Date(returnDueAt);
  if (due < now) return "overdue";
  const oneDayFromNow = new Date();
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
  if (due <= oneDayFromNow) return "warning";
  return "normal";
}

export default async function EquipmentListPage() {
  const { db } = await import("@/src/db");

  const equipmentList = await db
    .select()
    .from(equipment)
    .orderBy(equipment.name);

  const activeLoans = await db
    .select()
    .from(loans)
    .where(isNull(loans.returnedAt));

  const activeLoanMap = new Map(activeLoans.map((l) => [l.equipmentId, l]));

  return (
    <div className="min-h-full bg-muted/40 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">備品一覧</h1>
          <Button asChild>
            <Link href="/equipment/new">+ 新規登録</Link>
          </Button>
        </div>

        {equipmentList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              備品が登録されていません。
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {equipmentList.map((item) => {
              const activeLoan = activeLoanMap.get(item.id);
              const isAvailable = !activeLoan;
              const alertLevel = activeLoan
                ? getAlertLevel(activeLoan.returnDueAt)
                : "normal";

              const badgeClass = isAvailable
                ? "bg-green-100 text-green-700"
                : alertLevel === "overdue"
                  ? "bg-red-100 text-red-700"
                  : alertLevel === "warning"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-orange-100 text-orange-700";

              const badgeLabel = isAvailable
                ? "利用可能"
                : alertLevel === "overdue"
                  ? "期限超過"
                  : alertLevel === "warning"
                    ? "返却間近"
                    : "貸出中";

              return (
                <Card key={item.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/equipment/${item.id}`}>詳細</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
