import { createFileRoute } from "@tanstack/react-router";
import { TranslationPanel } from "~/components/TranslationPanel";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [{ title: "TranslateGemma UI" }],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-8 dark:from-zinc-950 dark:to-zinc-900">
      <TranslationPanel />
    </div>
  );
}
