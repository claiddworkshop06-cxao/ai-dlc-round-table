import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, isNull, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { QRCodeDisplay } from "@/components/equipment/QRCodeDisplay";
import { equipment, loans } from "@/src/schema";

export const dynamic = "force-dynamic";

function getDefaultReturnDate(defaultReturnDays: number | null): string {
  if (!defaultReturnDays) return "";
  const date = new Date();
  date.setDate(date.getDate() + defaultReturnDays);
  return date.toISOString().split("T")[0];
}

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

export default async function EquipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id: rawId } = await params;
  const { error, success } = await searchParams;
  const id = parseInt(rawId);
  if (isNaN(id)) notFound();

  const { db } = await import("@/src/db");

  const rows = await db.select().from(equipment).where(eq(equipment.id, id));
  const item = rows[0];
  if (!item) notFound();

  const activeLoanRows = await db
    .select()
    .from(loans)
    .where(and(eq(loans.equipmentId, id), isNull(loans.returnedAt)));
  const activeLoan = activeLoanRows[0] ?? null;

  const history = await db
    .select()
    .from(loans)
    .where(eq(loans.equipmentId, id))
    .orderBy(desc(loans.borrowedAt));

  const isAvailable = !activeLoan;

  async function lendEquipment(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const borrowerName = (formData.get("borrower_name") as string)?.trim();
    const returnDueAtStr = formData.get("return_due_at") as string;

    if (!borrowerName) return;

    // 同一人物がすでに別の備品を借りていないかチェック
    const existing = await db
      .select({ id: loans.id })
      .from(loans)
      .where(and(eq(loans.borrowerName, borrowerName), isNull(loans.returnedAt)))
      .limit(1);

    if (existing.length > 0) {
      redirect(`/equipment/${id}?error=already_borrowed`);
    }

    await db.insert(loans).values({
      equipmentId: id,
      borrowerName,
      returnDueAt: returnDueAtStr ? new Date(returnDueAtStr) : null,
    });

    revalidatePath(`/equipment/${id}`);
    revalidatePath("/equipment");
    redirect(`/equipment/${id}`);
  }

  async function returnEquipment(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const loanId = parseInt(formData.get("loan_id") as string);

    await db
      .update(loans)
      .set({ returnedAt: new Date() })
      .where(eq(loans.id, loanId));

    revalidatePath(`/equipment/${id}`);
    revalidatePath("/equipment");
    redirect(`/equipment/${id}`);
  }

  async function updateReturnDate(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const loanId = parseInt(formData.get("loan_id") as string);
    const returnDueAtStr = formData.get("return_due_at") as string;

    await db
      .update(loans)
      .set({ returnDueAt: returnDueAtStr ? new Date(returnDueAtStr) : null })
      .where(eq(loans.id, loanId));

    revalidatePath(`/equipment/${id}`);
    revalidatePath("/equipment");
    redirect(`/equipment/${id}?success=date_updated`);
  }

  const defaultReturnDate = getDefaultReturnDate(item.defaultReturnDays);

  return (
    <div className="min-h-full bg-white/30 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/equipment"
              className="text-sm text-muted-foreground hover:underline"
            >
              ← 備品一覧へ
            </Link>
            <h1 className="text-2xl font-bold mt-2">{item.name}</h1>
          </div>
          <Link
            href={`/equipment/${id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            編集
          </Link>
        </div>

        {item.description && (
          <p className="text-muted-foreground">{item.description}</p>
        )}

        <div className="flex items-center gap-3">
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {isAvailable ? "利用可能" : "貸出中"}
          </span>
          {item.defaultReturnDays && (
            <span className="text-sm text-muted-foreground">
              デフォルト返却期限: {item.defaultReturnDays}日
            </span>
          )}
        </div>

        {isAvailable ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">貸出する</CardTitle>
            </CardHeader>
            <CardContent>
              {error === "already_borrowed" && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  この方はすでに別の備品を借りています。返却してからお借りください。
                </div>
              )}
              <form action={lendEquipment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="borrower_name">借り手名 *</Label>
                  <Input
                    id="borrower_name"
                    name="borrower_name"
                    type="text"
                    required
                    placeholder="例：山田 太郎"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="return_due_at">返却予定日</Label>
                  <Input
                    id="return_due_at"
                    name="return_due_at"
                    type="date"
                    defaultValue={defaultReturnDate}
                  />
                </div>
                <Button type="submit" className="w-full">
                  借りる
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          activeLoan && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="py-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800">
                    現在の貸出情報
                  </p>
                  <p className="text-sm text-orange-700">
                    借り手: {activeLoan.borrowerName}
                  </p>
                  <p className="text-sm text-orange-700">
                    貸出日:{" "}
                    {activeLoan.borrowedAt.toLocaleDateString("ja-JP")}
                  </p>
                </div>

                <form action={updateReturnDate} className="space-y-2">
                  <input type="hidden" name="loan_id" value={activeLoan.id} />
                  <label
                    htmlFor="return_due_at_edit"
                    className="text-sm font-medium text-orange-800"
                  >
                    返却予定日
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="return_due_at_edit"
                      name="return_due_at"
                      type="date"
                      defaultValue={formatDateForInput(activeLoan.returnDueAt)}
                      className="h-8 w-full min-w-0 rounded-lg border border-input bg-white px-2.5 py-1 text-sm outline-none focus-visible:border-ring"
                    />
                    <button
                      type="submit"
                      className={`${buttonVariants({ variant: "outline", size: "sm" })} shrink-0`}
                    >
                      変更
                    </button>
                  </div>
                  {success === "date_updated" && (
                    <p className="text-sm text-green-700 font-medium">
                      ✓ 返却予定日を変更しました
                    </p>
                  )}
                </form>

                <form action={returnEquipment}>
                  <input
                    type="hidden"
                    name="loan_id"
                    value={activeLoan.id}
                  />
                  <Button type="submit" className="w-full">
                    返却する
                  </Button>
                </form>
              </CardContent>
            </Card>
          )
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">QRコード</CardTitle>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay equipmentId={id} />
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">貸出履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                履歴はありません。
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((loan) => (
                  <div
                    key={loan.id}
                    className="text-sm border-b border-border pb-2 last:border-0"
                  >
                    <p className="font-medium">{loan.borrowerName}</p>
                    <p className="text-muted-foreground">
                      貸出: {loan.borrowedAt.toLocaleDateString("ja-JP")}
                      {loan.returnedAt ? (
                        <>
                          {" "}
                          → 返却:{" "}
                          {loan.returnedAt.toLocaleDateString("ja-JP")}
                        </>
                      ) : (
                        <span className="ml-2 text-orange-600 font-medium">
                          貸出中
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
