import { useState, useCallback, useRef } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { translate } from "~/serverFunctions/translate";

export function TranslationPanel() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    duration?: number;
    tokens?: number;
  } | null>(null);

  // Track request ID to ignore stale responses
  const requestIdRef = useRef(0);

  const cancelPendingRequest = useCallback(() => {
    requestIdRef.current += 1;
    setIsLoading(false);
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;

    // Cancel any pending request and start new one
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    setIsLoading(true);
    setError(null);
    setTranslatedText("");
    setStats(null);

    try {
      const result = await translate({
        data: {
          text: sourceText,
          sourceLanguage,
          targetLanguage,
        },
      });

      // Ignore result if a newer request was started or request was cancelled
      if (requestIdRef.current !== currentRequestId) return;

      setTranslatedText(result.translation);

      if (result.stats.totalDuration) {
        const newStats: { duration: number; tokens?: number } = {
          duration: Math.round(result.stats.totalDuration / 1_000_000_000),
        };
        if (result.stats.evalCount !== undefined) {
          newStats.tokens = result.stats.evalCount;
        }
        setStats(newStats);
      }
    } catch (err) {
      // Ignore errors from stale requests
      if (requestIdRef.current !== currentRequestId) return;
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      // Only update loading state if this is still the current request
      if (requestIdRef.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  }, [sourceText, sourceLanguage, targetLanguage]);

  const handleSwapLanguages = useCallback(() => {
    cancelPendingRequest();
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setError(null);
    setStats(null);
  }, [sourceLanguage, targetLanguage, sourceText, translatedText, cancelPendingRequest]);

  const handleClear = useCallback(() => {
    cancelPendingRequest();
    setSourceText("");
    setTranslatedText("");
    setError(null);
    setStats(null);
  }, [cancelPendingRequest]);

  const handleCopy = useCallback(async () => {
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText);
      } catch {
        // Clipboard access may fail in insecure contexts
      }
    }
  }, [translatedText]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Language selectors */}
      <div className="mb-6 flex items-end gap-4">
        <div className="flex-1">
          <LanguageSelector
            value={sourceLanguage}
            onChange={setSourceLanguage}
            label="From"
            excludeCode={targetLanguage}
          />
        </div>

        <button
          type="button"
          onClick={handleSwapLanguages}
          className="mb-0.5 rounded-lg border border-zinc-100 bg-white p-2.5 text-zinc-600 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          title="Swap languages"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </button>

        <div className="flex-1">
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
            label="To"
            excludeCode={sourceLanguage}
          />
        </div>
      </div>

      {/* Text areas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Source text */}
        <div className="flex flex-col rounded-lg border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800">
          <textarea
            value={sourceText}
            onChange={(e) => {
              setSourceText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${String(Math.max(192, e.target.scrollHeight))}px`;
            }}
            placeholder="Enter text to translate..."
            className="min-h-48 w-full resize-none overflow-hidden bg-transparent p-4 text-lg focus:outline-none"
            style={{ height: "192px" }}
          />
          <div className="flex h-10 items-center justify-end gap-2 border-t border-zinc-100 px-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleClear}
              className={`rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 ${!sourceText ? "invisible" : ""}`}
              title="Clear"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <span className="text-sm text-zinc-400">{sourceText.length} chars</span>
          </div>
        </div>

        {/* Translated text */}
        <div className="flex flex-col rounded-lg border border-zinc-100 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div
            className={`min-h-48 flex-1 p-4 text-lg whitespace-pre-wrap ${
              isLoading ? "streaming-cursor" : ""
            }`}
          >
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : translatedText ? (
              translatedText
            ) : isLoading ? (
              <span className="text-zinc-400">Translating...</span>
            ) : (
              <span className="text-zinc-400">Translation will appear here</span>
            )}
          </div>
          <div className="flex h-10 items-center justify-end gap-2 border-t border-zinc-100 px-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleCopy}
              className={`rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 ${!translatedText ? "invisible" : ""}`}
              title="Copy to clipboard"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            {stats && (
              <span className="text-xs text-zinc-400">
                {stats.duration}s{stats.tokens !== undefined && ` • ${String(stats.tokens)} tokens`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Translate button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleTranslate}
          disabled={isLoading || !sourceText.trim() || !targetLanguage}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-zinc-900"
        >
          {isLoading ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Translating...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              Translate
            </>
          )}
        </button>
      </div>
    </div>
  );
}
