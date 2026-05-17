import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DISTRICTS } from "@/lib/constants";

type ParticipantRow = {
  full_name: string;
  birth_date: string;
  district: string;
  phone: string | null;
  status: "passed_adm";
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib diunggah" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = parseParticipants(buffer, file.name);
  if (!rows.length) return NextResponse.json({ error: "Data peserta tidak terbaca" }, { status: 422 });

  const admin = createAdminClient();
  const { error } = await admin.from("participants").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(new URL("/admin/participants?import=success", request.url), 303);
}

function parseParticipants(buffer: Buffer, fileName: string): ParticipantRow[] {
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const book = XLSX.read(buffer, { type: "buffer" });
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    return rows.map(normalizeRow).filter((row): row is ParticipantRow => Boolean(row));
  }

  return buffer
    .toString("utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
    .map(([fullName, birthDate, district, phone]) => normalizeRow({ full_name: fullName, birth_date: birthDate, district, phone }))
    .filter((row): row is ParticipantRow => Boolean(row));
}

function normalizeRow(row: Record<string, unknown>): ParticipantRow | null {
  const fullName = String(row.full_name ?? row.nama ?? row.Nama ?? row["Nama Lengkap"] ?? "").trim();
  const birthDate = normalizeDate(row.birth_date ?? row.tanggal_lahir ?? row["Tanggal Lahir"] ?? row.TanggalLahir);
  const district = normalizeDistrict(row.district ?? row.kecamatan ?? row.Kecamatan);
  if (!fullName || !birthDate || !district) return null;
  return {
    full_name: fullName,
    birth_date: birthDate,
    district,
    phone: String(row.phone ?? row.telepon ?? row.Telepon ?? "").trim() || null,
    status: "passed_adm",
  };
}

function normalizeDistrict(value: unknown) {
  const raw = String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();
  return DISTRICTS.find((district) => district === raw) ?? "";
}

function normalizeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return "";
    return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const raw = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}
