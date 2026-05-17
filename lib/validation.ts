import { z } from "zod";
import { DISTRICTS } from "@/lib/constants";

export const loginSchema = z.object({
  identifier: z.string().min(5, "Email admin atau nomor HP wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir tidak valid"),
  district: z.enum(DISTRICTS, { message: "Kecamatan wajib dipilih" }),
  phone: z.string().min(9, "Nomor HP tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const participantSchema = z.object({
  fullName: z.string().min(3),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  district: z.enum(DISTRICTS).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  status: z.enum(["passed_adm", "blocked"]).default("passed_adm"),
});

export const questionSchema = z.object({
  orderNumber: z.coerce.number().int().min(1).max(30),
  prompt: z.string().min(8),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  optionE: z.string().min(1),
  correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
  category: z.string().optional().or(z.literal("")),
});
