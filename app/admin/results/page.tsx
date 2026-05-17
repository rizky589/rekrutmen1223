import Link from "next/link";
import { Download } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { profile } = await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const from = (page - 1) * 25;
  const supabase = await createClient();
  const { data } = await supabase
    .from("exam_results")
    .select("*")
    .ilike("full_name", `%${params.q ?? ""}%`)
    .range(from, from + 24)
    .order("submitted_at", { ascending: false });

  return (
    <AppShell profile={profile}>
      <SectionHeader
        title="Hasil Ujian"
        description="Nilai hanya tersedia untuk admin."
        action={<Button asChild><Link href="/api/admin/export-results"><Download className="h-4 w-4" /> Export Excel</Link></Button>}
      />
      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <form className="mb-4 flex gap-2">
            <input className="h-10 w-full rounded-md border bg-background px-3 text-sm" name="q" defaultValue={params.q} placeholder="Cari peserta" />
            <Button variant="outline">Cari</Button>
          </form>
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Tanggal Lahir</TableHead><TableHead>Kecamatan</TableHead><TableHead>HP</TableHead><TableHead>Benar</TableHead><TableHead>Nilai</TableHead><TableHead>Kelulusan</TableHead><TableHead>Status</TableHead><TableHead>Submit</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.map((item) => (
                <TableRow key={item.attempt_id}>
                  <TableCell className="font-medium">{item.full_name}</TableCell>
                  <TableCell>{item.birth_date ?? "-"}</TableCell>
                  <TableCell>{item.district ?? "-"}</TableCell>
                  <TableCell>{item.phone ?? "-"}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{item.grade ?? "-"}</TableCell>
                  <TableCell>{item.result_status === "passed" ? "Lulus" : item.result_status === "failed" ? "Tidak Lulus" : "-"}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{formatDateTime(item.submitted_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
