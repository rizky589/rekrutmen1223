import Link from "next/link";
import { Download, FileQuestion, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const [participants, questions, submitted] = await Promise.all([
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("exam_attempts").select("id", { count: "exact", head: true }).eq("status", "submitted"),
  ]);

  return (
    <AppShell profile={profile}>
      <SectionHeader
        title="Dashboard Admin"
        description="Kelola data seleksi, soal, jadwal, dan hasil ujian."
        action={<Button asChild><Link href="/api/admin/export-results"><Download className="h-4 w-4" /> Export Excel</Link></Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Peserta ADM" value={participants.count ?? 0} icon={<UsersRound className="h-5 w-5" />} href="/admin/participants" />
        <Stat title="Soal Aktif" value={questions.count ?? 0} icon={<FileQuestion className="h-5 w-5" />} href="/admin/questions" />
        <Stat title="Submit Ujian" value={submitted.count ?? 0} icon={<Download className="h-5 w-5" />} href="/admin/results" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-14 justify-start"><Link href="/admin/participants">CRUD Peserta</Link></Button>
        <Button asChild variant="outline" className="h-14 justify-start"><Link href="/admin/questions">CRUD dan Import Soal</Link></Button>
        <Button asChild variant="outline" className="h-14 justify-start"><Link href="/admin/results">Lihat Hasil</Link></Button>
        <Button asChild variant="outline" className="h-14 justify-start"><Link href="/admin/settings">Jadwal dan Settings</Link></Button>
      </div>
    </AppShell>
  );
}

function Stat({ title, value, icon, href }: { title: string; value: number; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:-translate-y-0.5 hover:shadow-lg">
        <CardHeader><CardTitle className="flex items-center justify-between text-base">{title}{icon}</CardTitle></CardHeader>
        <CardContent><p className="text-3xl font-semibold">{value}</p></CardContent>
      </Card>
    </Link>
  );
}
