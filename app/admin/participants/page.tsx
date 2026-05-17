import { importParticipants, upsertParticipant } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { AppShell } from "@/components/app-shell";
import { ParticipantList } from "@/components/admin/participant-list";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireAdmin } from "@/lib/auth";
import { DISTRICTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Participant } from "@/types/database";

export default async function ParticipantsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { profile } = await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("participants").select("*").order("created_at", { ascending: false }).limit(50);
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  const { data: participants } = await query;

  return (
    <AppShell profile={profile}>
      <SectionHeader title="Peserta Lulus Administrasi" description="Nama peserta ujian dibatasi dari daftar ini." />
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Tambah Peserta</CardTitle></CardHeader>
            <CardContent>
              <ActionForm action={upsertParticipant} className="space-y-3">
                <Field name="fullName" label="Nama Lengkap" />
                <Field name="birthDate" label="Tanggal Lahir" type="date" />
                <div className="space-y-2">
                  <Label>Kecamatan</Label>
                  <Select name="district" defaultValue="">
                    <option value="" disabled>Pilih kecamatan</option>
                    {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                  </Select>
                </div>
                <Field name="phone" label="Nomor HP setelah register" />
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue="passed_adm">
                    <option value="passed_adm">Lulus ADM</option>
                    <option value="blocked">Diblokir</option>
                  </Select>
                </div>
                <Button className="w-full">Simpan</Button>
              </ActionForm>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Import Calon Mitra</CardTitle>
            </CardHeader>
            <CardContent>
              <ActionForm action={importParticipants} className="space-y-3">
                <p className="text-sm text-muted-foreground">Upload Excel/CSV cukup dengan kolom `nama`. Tanggal lahir, kecamatan, dan nomor HP akan diisi peserta saat register.</p>
                <Input name="file" type="file" accept=".xlsx,.xls,.csv,.txt" required />
                <Button className="w-full" variant="outline">Import Peserta</Button>
              </ActionForm>
            </CardContent>
          </Card>
        </div>
        <Card className="min-w-0">
          <CardHeader>
            <form className="flex flex-col gap-2 sm:flex-row">
              <Input name="q" placeholder="Cari nama atau nomor HP" defaultValue={params.q} />
              <Button variant="outline">Cari</Button>
            </form>
          </CardHeader>
          <CardContent>
            <ParticipantList participants={(participants ?? []) as Participant[]} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} /></div>;
}
