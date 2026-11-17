import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 이메일 주소에서 @ 앞부분(아이디)을 추출하여 display name으로 사용
 * 예: ydo9902@gmail.com -> ydo9902
 */
export function getEmailPrefix(email?: string | null, fallback = "사용자"): string {
  if (!email) return fallback;
  const prefix = email.split("@")[0]?.trim();
  return prefix || fallback;
}

export { clsx, twMerge, type ClassValue }
