import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type AnswerKey = "A" | "B" | "C" | "D" | "E";

type ParsedQuestion = {
  order_number: number;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_answer: AnswerKey;
  is_active: boolean;
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
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return NextResponse.json({ error: "Gunakan file Excel/CSV: .xlsx, .xls, atau .csv" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const questions = parseQuestions(buffer);
  if (!questions.length) {
    return NextResponse.json(
      {
        error: "Format soal tidak terbaca",
        contoh: "nomor,pertanyaan,a,b,c,d,e,kunci",
        catatan: "Gunakan Excel/CSV dengan kolom: nomor, pertanyaan, a, b, c, d, e, kunci. Kunci wajib A/B/C/D/E.",
      },
      { status: 422 },
    );
  }

  const admin = createAdminClient();
  await admin.storage.from("question-imports").upload(`${Date.now()}-${file.name}`, buffer, {
    upsert: true,
    contentType: file.type,
  });
  const { error } = await admin.from("questions").upsert(questions, { onConflict: "order_number" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.redirect(new URL("/admin/questions?import=success", request.url), 303);
}

function parseQuestions(buffer: Buffer): ParsedQuestion[] {
  const book = XLSX.read(buffer, { type: "buffer" });
  const sheet = book.Sheets[book.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false, defval: "" });
  return rows.map(normalizeQuestionRow).filter((row): row is ParsedQuestion => Boolean(row));
}

function normalizeQuestionRow(row: Record<string, unknown>): ParsedQuestion | null {
  const data = normalizeKeys(row);
  const orderNumber = Number(data.nomor ?? data.no ?? data.number ?? data.order_number);
  const prompt = clean(data.pertanyaan ?? data.soal ?? data.question ?? data.prompt);
  const optionA = clean(data.a ?? data.option_a ?? data.pilihan_a);
  const optionB = clean(data.b ?? data.option_b ?? data.pilihan_b);
  const optionC = clean(data.c ?? data.option_c ?? data.pilihan_c);
  const optionD = clean(data.d ?? data.option_d ?? data.pilihan_d);
  const optionE = clean(data.e ?? data.option_e ?? data.pilihan_e);
  const answer = clean(data.kunci ?? data.jawaban ?? data.correct_answer ?? data.answer).toUpperCase() as AnswerKey;

  if (
    !orderNumber ||
    orderNumber < 1 ||
    orderNumber > 30 ||
    !prompt ||
    !optionA ||
    !optionB ||
    !optionC ||
    !optionD ||
    !optionE ||
    !["A", "B", "C", "D", "E"].includes(answer)
  ) {
    return null;
  }

  return {
    order_number: orderNumber,
    prompt,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    option_e: optionE,
    correct_answer: answer,
    is_active: true,
  };
}

function normalizeKeys(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key
        .trim()
        .toLowerCase()
        .replace(/\u00a0/g, " ")
        .replace(/[^\p{L}\p{N}]+/gu, "_")
        .replace(/^_+|_+$/g, ""),
      value,
    ]),
  ) as Record<string, unknown>;
}

function clean(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}
