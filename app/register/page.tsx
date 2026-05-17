import Link from "next/link";
import { signUp } from "@/app/actions";
import { ActionForm } from "@/components/action-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DISTRICTS } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#070b22] px-4 py-8">
      <div className="login-cyber-grid" />
      <div className="login-morph-shape left-[6%] top-[12%] h-36 w-36 opacity-50" />
      <div className="login-morph-shape right-[8%] top-[18%] h-56 w-56 opacity-40 [animation-delay:1.4s]" />
      <div className="login-morph-shape bottom-[8%] left-[18%] h-44 w-44 opacity-30 [animation-delay:2.8s]" />

      <div className="relative z-10 w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Registrasi Peserta</CardTitle>
            <CardDescription>Akun hanya bisa dibuat jika nama dan tanggal lahir sesuai dengan daftar peserta.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm action={signUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input id="fullName" name="fullName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input id="birthDate" name="birthDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Kecamatan</Label>
                <Select id="district" name="district" required defaultValue="">
                  <option value="" disabled>Pilih kecamatan</option>
                  {DISTRICTS.map((district) => <option key={district} value={district}>{district}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" name="phone" inputMode="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required minLength={6} />
              </div>
              <Button className="w-full">Buat Akun</Button>
              <p className="text-center text-sm text-muted-foreground">
                Sudah punya akun? <Link href="/login" className="font-medium text-primary">Masuk</Link>
              </p>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
