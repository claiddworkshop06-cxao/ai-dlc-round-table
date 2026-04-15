import Link from "next/link";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Button, buttonVariants } from "@/components/ui/button";
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

  async function returnFromList(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const loanId = parseInt(formData.get("loan_id") as string);
    await db
      .update(loans)
      .set({ returnedAt: new Date() })
      .where(eq(loans.id, loanId));
    revalidatePath("/equipment");
  }

  return (
    <div className="min-h-full bg-white/30 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">備品一覧</h1>
          <Link href="/equipment/new" className={buttonVariants()}>
            + 新規登録
          </Link>
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
                  <CardContent className="py-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}
                        >
                          {badgeLabel}
                        </span>
                      </div>
                      {!isAvailable && activeLoan && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          借り手: {activeLoan.borrowerName}
                          {activeLoan.returnDueAt && (
                            <> ／ 返却予定: {activeLoan.returnDueAt.toLocaleDateString("ja-JP")}</>
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAvailable ? (
                        <Link
                          href={`/equipment/${item.id}`}
                          className={buttonVariants({ size: "sm" })}
                        >
                          借りる
                        </Link>
                      ) : (
                        <form action={returnFromList}>
                          <input
                            type="hidden"
                            name="loan_id"
                            value={activeLoan!.id}
                          />
                          <Button type="submit" size="sm">
                            返却する
                          </Button>
                        </form>
                      )}
                      <Link
                        href={`/equipment/${item.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        詳細
                      </Link>
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
