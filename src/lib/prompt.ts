import { getLanguageName } from "./languages";

/**
 * Builds the official TranslateGemma prompt format.
 *
 * Important: There must be two blank lines before the text to translate.
 *
 * @see https://huggingface.co/google/translategemma-27b-it
 */
export function buildTranslationPrompt(
  text: string,
  sourceCode: string,
  targetCode: string
): string {
  const sourceLang = getLanguageName(sourceCode);
  const targetLang = getLanguageName(targetCode);

  return `You are a professional ${sourceLang} (${sourceCode}) to ${targetLang} (${targetCode}) translator. Your goal is to accurately convey the meaning and nuances of the original ${sourceLang} text while adhering to ${targetLang} grammar, vocabulary, and cultural sensitivities.
Produce only the ${targetLang} translation, without any additional explanations or commentary. Please translate the following ${sourceLang} text into ${targetLang}:


${text}`;
}
