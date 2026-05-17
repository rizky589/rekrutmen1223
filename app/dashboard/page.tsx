import Link from "next/link";
import { Clock3, FileCheck2, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

const statusMessages: Record<string, string> = {
  "questions-empty": "Soal ujian belum tersedia. Hubungi admin untuk menginput atau import soal terlebih dahulu.",
  "questions-incomplete": "Jumlah soal aktif belum lengkap.",
  "not-eligible": "Akun Anda belum terhubung ke daftar peserta lulus administrasi.",
  "not-open": "Jadwal ujian belum dibuka.",
  closed: "Jadwal ujian sudah ditutup.",
  submitted: "Jawaban Anda sudah pernah dikirim.",
  expired: "Sesi ujian sebelumnya sudah melewati 60 menit.",
  done: "Jawaban berhasil dikirim.",
  passed: "Nilai Anda di atas KKM.",
  failed: "Nilai Anda di bawah KKM.",
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { user, profile } = await requireProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: attempt }, { data: participant }, { data: settings }] = await Promise.all([
    supabase.from("exam_attempts").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("participants").select("*").eq("id", profile.participant_id).maybeSingle(),
    supabase.from("app_settings").select("key,value").in("key", ["exam_open_at", "exam_close_at"]),
  ]);
  const openAt = settings?.find((item) => item.key === "exam_open_at")?.value;
  const closeAt = settings?.find((item) => item.key === "exam_close_at")?.value;

  const latestResultStatus = attempt?.status === "submitted" ? attempt.result_status : null;
  const visibleStatus = params.status ?? latestResultStatus;

  return (
    <AppShell profile={profile}>
      <SectionHeader title={`Halo, ${profile.full_name ?? "Peserta"}`} description="Pantau status seleksi dan mulai ujian saat jadwal dibuka." />
      {visibleStatus && statusMessages[visibleStatus] ? (
        <div className="mb-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {statusMessages[visibleStatus]}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileCheck2 className="h-4 w-4" /> Status Administrasi</CardTitle></CardHeader>
          <CardContent>
            <Badge className={participant?.status === "passed_adm" ? "border-primary/30 bg-primary/10 text-primary" : "border-destructive/30 bg-destructive/10 text-destructive"}>
              {participant?.status === "passed_adm" ? "Lulus Administrasi" : "Belum Eligible"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="h-4 w-4" /> Jadwal Ujian</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Buka: {formatDateTime(openAt)}</p>
            <p>Tutup: {formatDateTime(closeAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-4 w-4" /> Status Ujian</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Badge>{attempt?.status ?? "Belum mulai"}</Badge>
            {attempt?.status === "submitted" ? (
              <div className="space-y-2">
                <Button className="w-full" disabled>Ujian Selesai</Button>
                <p className="text-xs leading-5 text-muted-foreground">
                  Jawaban sudah dikirim. Peserta tidak bisa membuka ujian lagi kecuali admin melakukan reset.
                </p>
              </div>
            ) : attempt?.status === "expired" ? (
              <div className="space-y-2">
                <Button asChild className="w-full"><Link href="/exam">Mulai Ulang Ujian</Link></Button>
                <p className="text-xs leading-5 text-muted-foreground">Sesi sebelumnya melewati batas waktu 60 menit.</p>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link href="/exam">{attempt?.status === "in_progress" ? "Lanjutkan Ujian" : "Mulai Ujian"}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader><CardTitle>Catatan Penting</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <p>Siapkan koneksi stabil sebelum mulai. Timer berjalan 60 menit sejak tombol mulai ditekan.</p>
          <p>Soal 1 sampai 30 wajib dijawab. Sistem menolak submit jika ada jawaban kosong.</p>
          <p>Nilai tidak ditampilkan ke peserta. Hasil hanya dapat dilihat admin.</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
