import Image from "next/image";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireProfile } from "@/lib/auth";
import { DISTRICTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

async function updateProfile(formData: FormData) {
  "use server";
  const { user } = await requireProfile();
  const supabase = await createClient();
  let avatar_url: string | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { data } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (data?.path) {
      const publicUrl = supabase.storage.from("avatars").getPublicUrl(data.path);
      avatar_url = publicUrl.data.publicUrl;
    }
  }
  await supabase.from("profiles").update({
    full_name: formData.get("full_name"),
    birth_date: formData.get("birth_date"),
    district: formData.get("district"),
    phone: formData.get("phone"),
    ...(avatar_url ? { avatar_url } : {}),
  }).eq("id", user.id);
  revalidatePath("/profile");
}

export default async function ProfilePage() {
  const { profile } = await requireProfile();
  return (
    <AppShell profile={profile}>
      <SectionHeader title="Profil" description="Lengkapi identitas dan unggah foto profil ke Supabase Storage." />
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Data Akun</CardTitle></CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            {profile.avatar_url ? <Image src={profile.avatar_url} alt="Avatar" width={72} height={72} className="rounded-full" /> : null}
            <div className="space-y-2"><Label>Nama</Label><Input name="full_name" defaultValue={profile.full_name ?? ""} /></div>
            <div className="space-y-2"><Label>Tanggal Lahir</Label><Input name="birth_date" type="date" defaultValue={profile.birth_date ?? ""} /></div>
            <div className="space-y-2">
              <Label>Kecamatan</Label>
              <Select name="district" defaultValue={profile.district ?? ""}>
                <option value="" disabled>Pilih kecamatan</option>
                {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
              </Select>
            </div>
            <div className="space-y-2"><Label>Nomor HP</Label><Input name="phone" defaultValue={profile.phone ?? ""} /></div>
            <div className="space-y-2"><Label>Avatar</Label><Input name="avatar" type="file" accept="image/*" /></div>
            <Button>Simpan Profil</Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
