import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/EquipmentForm";
import { equipment } from "@/src/schema";

export default function NewEquipmentPage() {
  async function createEquipment(formData: FormData) {
    "use server";
    const { db } = await import("@/src/db");
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const defaultReturnDaysStr = formData.get("default_return_days") as string;

    if (!name) return;

    await db.insert(equipment).values({
      name,
      description: description || null,
      defaultReturnDays: defaultReturnDaysStr
        ? parseInt(defaultReturnDaysStr)
        : null,
    });

    redirect("/equipment");
  }

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
          <h1 className="text-2xl font-bold mt-2">備品の新規登録</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <EquipmentForm action={createEquipment} submitLabel="登録する" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
