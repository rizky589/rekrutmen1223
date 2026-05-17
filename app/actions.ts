"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { loginSchema, participantSchema, questionSchema, registerSchema } from "@/lib/validation";
import { DISTRICTS, EXAM_DURATION_SECONDS, TOTAL_QUESTIONS } from "@/lib/constants";
import { requireAdmin, requireProfile, requireUser } from "@/lib/auth";

export type ActionState = { ok: boolean; message: string };

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function participantEmailFromPhone(phone: string) {
  return `${normalizePhone(phone)}@peserta.local`;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseEnv()) return { ok: false, message: "Supabase belum dikonfigurasi. Isi .env.local lalu restart dev server." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Input tidak valid" };

  const supabase = await createClient();
  const identifier = parsed.data.identifier.trim();
  const email = identifier.includes("@") ? identifier : participantEmailFromPhone(identifier);
  const { error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error) return { ok: false, message: "Email/nomor HP atau password salah." };

  redirect(formData.get("next")?.toString() || "/dashboard");
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasSupabaseAdminEnv()) return { ok: false, message: "Supabase belum lengkap. Isi URL, anon key, dan service role key di .env.local." };
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Input tidak valid" };

  const supabase = await createClient();
  const admin = createAdminClient();
  const phone = normalizePhone(parsed.data.phone);
  const { data: participant } = await admin
    .from("participants")
    .select("id,full_name,registered_user_id")
    .eq("status", "passed_adm")
    .is("registered_user_id", null);

  const matchedParticipant = participant?.find((item) => normalizeName(item.full_name) === normalizeName(parsed.data.fullName));
  const officialName = matchedParticipant?.full_name.trim().toLowerCase();
  const inputName = parsed.data.fullName.trim().toLowerCase();
  if (!matchedParticipant || officialName !== inputName) {
    return { ok: false, message: "Nama tidak ada di daftar peserta, atau nama tersebut sudah pernah register." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: participantEmailFromPhone(phone),
    password: parsed.data.password,
    options: {
      data: {
        full_name: matchedParticipant.full_name,
        birth_date: parsed.data.birthDate,
        district: parsed.data.district,
        phone,
        participant_id: matchedParticipant.id,
      },
    },
  });

  if (error) return { ok: false, message: error.message };
  if (data.user) {
    await admin
      .from("participants")
      .update({
        birth_date: parsed.data.birthDate,
        district: parsed.data.district,
        phone,
        registered_user_id: data.user.id,
      })
      .eq("id", matchedParticipant.id);
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function upsertParticipant(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = participantSchema.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    district: formData.get("district"),
    phone: formData.get("phone"),
    status: formData.get("status") || "passed_adm",
  });
  if (!parsed.success) return { ok: false, message: "Data peserta tidak valid." };

  const supabase = await createClient();
  const payload = {
    full_name: parsed.data.fullName,
    birth_date: parsed.data.birthDate || null,
    district: parsed.data.district || null,
    phone: parsed.data.phone || null,
    status: parsed.data.status,
  };
  const id = formData.get("id")?.toString();
  const query = id
    ? supabase.from("participants").update(payload).eq("id", id)
    : supabase.from("participants").insert(payload);
  const { error } = await query;
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/participants");
  return { ok: true, message: "Peserta berhasil disimpan." };
}

export async function deleteParticipant(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID peserta tidak ditemukan.");
  const supabase = await createClient();
  const { error } = await supabase.from("participants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/participants");
}

export async function resetParticipantExam(formData: FormData) {
  await requireAdmin();
  const participantId = formData.get("participantId")?.toString();
  if (!participantId) throw new Error("ID peserta tidak ditemukan.");

  const supabase = await createClient();
  const { data: attempts, error: attemptsError } = await supabase
    .from("exam_attempts")
    .select("id")
    .eq("participant_id", participantId);
  if (attemptsError) throw new Error(attemptsError.message);

  const attemptIds = attempts?.map((attempt) => attempt.id) ?? [];
  if (attemptIds.length) {
    const { error: answersError } = await supabase.from("exam_answers").delete().in("attempt_id", attemptIds);
    if (answersError) throw new Error(answersError.message);

    const { error: examError } = await supabase.from("exam_attempts").delete().in("id", attemptIds);
    if (examError) throw new Error(examError.message);
  }

  revalidatePath("/admin/participants");
  revalidatePath("/admin/results");
}

type ParticipantImportRow = {
  full_name: string;
  birth_date: string | null;
  district: string | null;
  phone: string | null;
  status: "passed_adm";
};

export async function importParticipants(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "File peserta wajib diunggah." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = parseParticipantImport(buffer, file.name);
  if (!rows.length) {
    return { ok: false, message: "Data tidak terbaca. Minimal gunakan kolom: nama." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("participants").insert(rows);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/admin/participants");
  return { ok: true, message: `${rows.length} peserta berhasil diimport.` };
}

function parseParticipantImport(buffer: Buffer, fileName: string): ParticipantImportRow[] {
  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const book = XLSX.read(buffer, { type: "buffer" });
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      raw: false,
      defval: "",
    });
    return rows.map(normalizeParticipantRow).filter((row): row is ParticipantImportRow => Boolean(row));
  }

  return buffer
    .toString("utf8")
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(","))
    .map(([fullName, birthDate, district, phone]) =>
      normalizeParticipantRow({ full_name: fullName, birth_date: birthDate, district, phone }),
    )
    .filter((row): row is ParticipantImportRow => Boolean(row));
}

function normalizeParticipantRow(row: Record<string, unknown>): ParticipantImportRow | null {
  const normalized = normalizeImportKeys(row);
  const fullName = String(normalized.full_name ?? normalized.nama ?? normalized.nama_lengkap ?? "").trim();
  const birthDate = normalizeImportDate(normalized.birth_date ?? normalized.tanggal_lahir ?? normalized.tgllahir ?? normalized.tgl_lahir);
  const district = normalizeImportDistrict(normalized.district ?? normalized.kecamatan);
  if (!fullName) return null;

  return {
    full_name: fullName,
    birth_date: birthDate || null,
    district: district || null,
    phone: String(row.phone ?? row.telepon ?? row.Telepon ?? "").trim() || null,
    status: "passed_adm",
  };
}

function normalizeImportKeys(row: Record<string, unknown>) {
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

function normalizeImportDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return "";
    return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const raw = String(value ?? "").trim();
  const parsedDate = new Date(raw);
  if (!Number.isNaN(parsedDate.getTime()) && /[a-zA-Z]/.test(raw)) return parsedDate.toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function normalizeImportDistrict(value: unknown) {
  const raw = String(value ?? "").trim().replace(/\s+/g, " ").toUpperCase();
  return DISTRICTS.find((district) => district === raw) ?? "";
}

export async function upsertQuestion(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = questionSchema.safeParse({
    orderNumber: formData.get("orderNumber"),
    prompt: formData.get("prompt"),
    optionA: formData.get("optionA"),
    optionB: formData.get("optionB"),
    optionC: formData.get("optionC"),
    optionD: formData.get("optionD"),
    optionE: formData.get("optionE"),
    correctAnswer: formData.get("correctAnswer"),
    category: formData.get("category"),
  });
  if (!parsed.success) return { ok: false, message: "Data soal tidak valid." };

  const supabase = await createClient();
  const payload = {
    order_number: parsed.data.orderNumber,
    prompt: parsed.data.prompt,
    option_a: parsed.data.optionA,
    option_b: parsed.data.optionB,
    option_c: parsed.data.optionC,
    option_d: parsed.data.optionD,
    option_e: parsed.data.optionE,
    correct_answer: parsed.data.correctAnswer,
    category: parsed.data.category || null,
    is_active: true,
  };
  const id = formData.get("id")?.toString();
  const query = id
    ? supabase.from("questions").update(payload).eq("id", id)
    : supabase.from("questions").upsert(payload, { onConflict: "order_number" });
  const { error } = await query;
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/questions");
  return { ok: true, message: "Soal berhasil disimpan." };
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) throw new Error("ID soal tidak ditemukan.");
  const supabase = await createClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/questions");
}

export async function startAttempt() {
  const { user, profile } = await requireProfile();
  const supabase = await createClient();

  const { data: settings } = await supabase.from("app_settings").select("key,value").in("key", ["exam_open_at", "exam_close_at"]);
  const openAt = settings?.find((item) => item.key === "exam_open_at")?.value;
  const closeAt = settings?.find((item) => item.key === "exam_close_at")?.value;
  const now = Date.now();
  if (openAt && !Number.isNaN(new Date(openAt).getTime()) && now < new Date(openAt).getTime()) redirect("/dashboard?status=not-open");
  if (closeAt && !Number.isNaN(new Date(closeAt).getTime()) && now > new Date(closeAt).getTime()) redirect("/dashboard?status=closed");

  const { data: participant } = await supabase
    .from("participants")
    .select("id")
    .eq("id", profile.participant_id)
    .eq("status", "passed_adm")
    .maybeSingle();
  if (!participant) redirect("/dashboard?status=not-eligible");

  const { data: existing } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["in_progress", "submitted"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "submitted") redirect("/dashboard?status=submitted");
  if (existing?.status === "in_progress") {
    const elapsed = Math.floor((Date.now() - new Date(existing.started_at).getTime()) / 1000);
    if (elapsed <= EXAM_DURATION_SECONDS) return existing.id as string;
    await supabase
      .from("exam_attempts")
      .update({
        status: "expired",
        submitted_at: new Date().toISOString(),
        duration_seconds: EXAM_DURATION_SECONDS,
      })
      .eq("id", existing.id)
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("exam_attempts")
    .insert({ user_id: user.id, participant_id: participant.id, status: "in_progress" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function submitExam(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const attemptId = formData.get("attemptId")?.toString();
  if (!attemptId) throw new Error("Attempt tidak ditemukan.");

  const { data: attempt } = await supabase
    .from("exam_attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();
  if (!attempt || attempt.status !== "in_progress") redirect("/dashboard");

  const elapsed = Math.floor((Date.now() - new Date(attempt.started_at).getTime()) / 1000);
  const isExpired = elapsed > EXAM_DURATION_SECONDS + 10;

  const { data: questions } = await supabase.from("questions").select("id,correct_answer").eq("is_active", true).order("order_number").limit(TOTAL_QUESTIONS);
  const answers = questions?.map((question) => ({
    attempt_id: attemptId,
    question_id: question.id,
    selected_answer: formData.get(`q_${question.id}`)?.toString() || null,
    is_correct: formData.get(`q_${question.id}`)?.toString() === question.correct_answer,
  })) ?? [];

  if (!answers.length || answers.some((answer) => !answer.selected_answer)) {
    throw new Error("Semua soal wajib dijawab.");
  }

  const score = answers.filter((answer) => answer.is_correct).length;
  const grade = Math.round((score / TOTAL_QUESTIONS) * 100);
  const resultStatus = grade >= 60 ? "passed" : "failed";
  await supabase.from("exam_answers").upsert(answers, { onConflict: "attempt_id,question_id" });
  await supabase
    .from("exam_attempts")
    .update({
      status: isExpired ? "expired" : "submitted",
      submitted_at: new Date().toISOString(),
      score,
      grade,
      result_status: resultStatus,
      duration_seconds: Math.min(elapsed, EXAM_DURATION_SECONDS),
    })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  redirect(`/dashboard?status=${resultStatus}`);
}
