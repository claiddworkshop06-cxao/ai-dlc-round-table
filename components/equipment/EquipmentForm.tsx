"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DefaultValues {
  name: string;
  description: string | null;
  defaultReturnDays: number | null;
}

interface EquipmentFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  submitLabel?: string;
}

export function EquipmentForm({
  action,
  defaultValues,
  submitLabel = "登録する",
}: EquipmentFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">備品名 *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name ?? ""}
          placeholder="例：プロジェクター A"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          placeholder="備品の説明（任意）"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default_return_days">デフォルト返却期限（日数）</Label>
        <Input
          id="default_return_days"
          name="default_return_days"
          type="number"
          min="1"
          defaultValue={defaultValues?.defaultReturnDays ?? ""}
          placeholder="例：7"
        />
      </div>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
