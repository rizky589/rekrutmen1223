import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetupPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
              <Database className="h-5 w-5" />
            </div>
            <CardTitle>Supabase belum dikonfigurasi</CardTitle>
            <CardDescription>
              Aplikasi butuh URL dan API key Supabase untuk login, register, database peserta, soal, dan hasil ujian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-md border bg-muted/40 p-4">
              <p className="mb-2 text-sm font-medium">Buat file `.env.local` di folder project:</p>
              <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000`}
              </pre>
            </div>
            <ol className="grid gap-2 text-sm text-muted-foreground">
              <li>1. Buka Supabase Dashboard lalu masuk ke Project Settings → API.</li>
              <li>2. Salin Project URL, anon public key, dan service_role key.</li>
              <li>3. Jalankan SQL di `supabase/schema.sql` lewat Supabase SQL Editor.</li>
              <li>4. Restart dev server: `npm run dev`.</li>
            </ol>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noreferrer">
                  Buka Supabase API <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
