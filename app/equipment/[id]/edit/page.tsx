import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq, isNull, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { equipment, loans } from "@/src/schema";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = parseInt(rawId);
  if (isNaN(id)) notFound();

  const { db } = await import("@/src/db");
  const rows = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id));
  const item = rows[0];
  if (!item) notFound();

  async function updateEquipment(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const defaultReturnDaysStr = formData.get(
      "default_return_days"
    ) as string;

    if (!name) return;

    await db
      .update(equipment)
      .set({
        name,
        description: description || null,
        defaultReturnDays: defaultReturnDaysStr
          ? parseInt(defaultReturnDaysStr)
          : null,
      })
      .where(eq(equipment.id, id));

    revalidatePath("/equipment");
    revalidatePath(`/equipment/${id}`);
    redirect(`/equipment/${id}`);
  }

  async function deleteEquipment() {
    "use server";
    const { db } = await import("@/src/db");

    const activeLoans = await db
      .select()
      .from(loans)
      .where(and(eq(loans.equipmentId, id), isNull(loans.returnedAt)));

    if (activeLoans.length > 0) return;

    await db.delete(equipment).where(eq(equipment.id, id));
    revalidatePath("/equipment");
    redirect("/equipment");
  }

  return (
    <div className="min-h-full bg-white/30 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Link
            href={`/equipment/${id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← 詳細へ戻る
          </Link>
          <h1 className="text-2xl font-bold mt-2">備品の編集</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EquipmentForm
              action={updateEquipment}
              defaultValues={{
                name: item.name,
                description: item.description,
                defaultReturnDays: item.defaultReturnDays,
              }}
              submitLabel="更新する"
            />
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <h2 className="text-sm font-medium text-red-700 mb-3">
              危険な操作
            </h2>
            <form action={deleteEquipment}>
              <button
                type="submit"
                className="w-full rounded-md bg-red-600 text-white text-sm font-medium py-2 px-4 hover:bg-red-700 transition-colors"
              >
                この備品を削除する
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              貸出中の備品は削除できません。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
