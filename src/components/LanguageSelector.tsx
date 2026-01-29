import { useState, useMemo } from "react";
import { languages } from "~/lib/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  excludeCode?: string;
}

export function LanguageSelector({ value, onChange, label, excludeCode }: LanguageSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredLanguages = useMemo(() => {
    return languages
      .filter((lang) => lang.code !== excludeCode)
      .filter(
        (lang) =>
          lang.name.toLowerCase().includes(search.toLowerCase()) ||
          lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
          lang.code.toLowerCase().includes(search.toLowerCase())
      );
  }, [search, excludeCode]);

  const selectedLanguage = languages.find((lang) => lang.code === value);

  return (
    <div className="relative">
      <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selectedLanguage?.name ?? "Select language"}`}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-100 bg-white px-4 py-2.5 text-left shadow-sm transition-colors hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-zinc-600"
      >
        <span className="flex items-center gap-2">
          <span className="font-medium">{selectedLanguage?.name ?? "Select language"}</span>
          {selectedLanguage && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ({selectedLanguage.nativeName})
            </span>
          )}
        </span>
        <svg
          className={`h-5 w-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setSearch("");
            }}
          />
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-100 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-800">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search languages..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="w-full rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700"
                autoFocus
              />
            </div>
            <ul className="max-h-60 overflow-auto py-1" role="listbox" aria-label={label}>
              {filteredLanguages.map((lang) => (
                <li key={lang.code} role="option" aria-selected={lang.code === value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(lang.code);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 ${
                      lang.code === value ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {lang.nativeName}
                    </span>
                    <span className="ml-auto text-xs text-zinc-400">{lang.code}</span>
                  </button>
                </li>
              ))}
              {filteredLanguages.length === 0 && (
                <li className="px-4 py-2 text-sm text-zinc-500">No languages found</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
