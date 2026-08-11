import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte um valor digitado em formato BR (ex: "1.500,00", "50,00", "50")
 * pra number. Sem isso, `Number(v.replace(",", "."))` transforma "1.500,00"
 * em "1.500.00" (NaN) — qualquer valor com separador de milhar falhava
 * silenciosamente.
 */
export function parseBRLAmount(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d,.-]/g, "");
  if (cleaned.includes(",") && cleaned.includes(".")) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  if (cleaned.includes(",")) {
    return Number(cleaned.replace(",", "."));
  }
  return Number(cleaned);
}
