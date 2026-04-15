import Link from "next/link";
import { isNull } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
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

const alertCardClass: Record<AlertLevel, string> = {
  overdue: "border-red-300 bg-red-50",
  warning: "border-yellow-300 bg-yellow-50",
  normal: "border-orange-200 bg-orange-50",
};

const alertBadgeClass: Record<AlertLevel, string> = {
  overdue: "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-700",
  normal: "bg-orange-100 text-orange-700",
};

const alertLabel: Record<AlertLevel, string> = {
  overdue: "期限超過",
  warning: "返却間近",
  normal: "貸出中",
};

export default async function StatusPage() {
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

  const items = equipmentList.map((item) => {
    const activeLoan = activeLoanMap.get(item.id) ?? null;
    const alertLevel = activeLoan
      ? getAlertLevel(activeLoan.returnDueAt)
      : "normal";
    return { ...item, activeLoan, alertLevel };
  });

  const onLoanItems = items.filter((i) => i.activeLoan);
  const availableItems = items.filter((i) => !i.activeLoan);
  const overdueCount = onLoanItems.filter(
    (i) => i.alertLevel === "overdue"
  ).length;
  const warningCount = onLoanItems.filter(
    (i) => i.alertLevel === "warning"
  ).length;

  return (
    <div className="min-h-full bg-white/30 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">貸出状況</h1>

        {/* Summary badges */}
        <div className="flex gap-3 flex-wrap">
          <span className="text-sm px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
            利用可能: {availableItems.length}件
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">
            貸出中: {onLoanItems.length}件
          </span>
          {overdueCount > 0 && (
            <span className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">
              期限超過: {overdueCount}件
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
              返却間近: {warningCount}件
            </span>
          )}
        </div>

        {/* On loan items */}
        {onLoanItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              貸出中
            </h2>
            {onLoanItems.map((item) => (
              <Card
                key={item.id}
                className={alertCardClass[item.alertLevel]}
              >
                <CardContent className="py-4 flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${alertBadgeClass[item.alertLevel]}`}
                      >
                        {alertLabel[item.alertLevel]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      借り手: {item.activeLoan!.borrowerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      貸出日:{" "}
                      {item.activeLoan!.borrowedAt.toLocaleDateString("ja-JP")}
                    </p>
                    {item.activeLoan!.returnDueAt && (
                      <p
                        className={`text-sm font-medium ${
                          item.alertLevel === "overdue"
                            ? "text-red-700"
                            : item.alertLevel === "warning"
                              ? "text-yellow-700"
                              : "text-muted-foreground"
                        }`}
                      >
                        返却予定:{" "}
                        {item.activeLoan!.returnDueAt.toLocaleDateString(
                          "ja-JP"
                        )}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/equipment/${item.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    操作
                  </Link>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* Available items */}
        {availableItems.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              利用可能
            </h2>
            {availableItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                      利用可能
                    </span>
                    <Link
                      href={`/equipment/${item.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      詳細
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {equipmentList.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              備品が登録されていません。
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
