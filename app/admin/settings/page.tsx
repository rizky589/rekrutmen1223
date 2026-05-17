import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function saveSettings(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  const rows = ["exam_open_at", "exam_close_at"].map((key) => ({ key, value: formData.get(key)?.toString() || "" }));
  await supabase.from("app_settings").upsert(rows, { onConflict: "key" });
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key,value").in("key", ["exam_open_at", "exam_close_at"]);
  const value = (key: string) => data?.find((item) => item.key === key)?.value?.slice(0, 16) ?? "";

  return (
    <AppShell profile={profile}>
      <SectionHeader title="Settings" description="Atur waktu buka dan tutup seleksi. Setelah melewati jam tutup, peserta tidak bisa memulai ujian." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Jadwal Ujian Peserta</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className="space-y-4">
            <div className="space-y-2"><Label>Buka</Label><Input type="datetime-local" name="exam_open_at" defaultValue={value("exam_open_at")} /></div>
            <div className="space-y-2"><Label>Tutup</Label><Input type="datetime-local" name="exam_close_at" defaultValue={value("exam_close_at")} /></div>
            <Button>Simpan Settings</Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
