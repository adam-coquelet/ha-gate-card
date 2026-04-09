import { fr } from "./fr";
import { en } from "./en";

const languages: Record<string, Record<string, Record<string, string>>> = { en, fr };

export function t(key: string, lang?: string): string {
  const resolved =
    !lang || lang === "auto"
      ? navigator.language?.substring(0, 2) || "en"
      : lang;
  const dict = languages[resolved] || languages["en"];
  const [section, k] = key.split(".");
  return dict?.[section]?.[k] ?? key;
}
