import KeywordInput from "@/components/KeywordInput";
import KeywordChips from "@/components/KeywordChips";
import SuggestionCards from "@/components/SuggestionCards";
import RegionSelector from "@/components/RegionSelector";
import ResearchButton from "@/components/ResearchButton";
import ResearchResults from "@/components/ResearchResults";
import FinalList from "@/components/FinalList";
import ErrorDisplay from "@/components/ErrorDisplay";

export default function Home() {
  return (
    <main className="max-w-[1200px] mx-auto p-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          YouTube Research Tool
        </h1>
        <p className="text-gray-600">
          Исследуй конкурентов по ключевым запросам
        </p>
      </section>

      <section className="mb-6">
        <KeywordInput />
        <KeywordChips />
        <SuggestionCards />
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <RegionSelector />
        </div>
        <ErrorDisplay />
        <ResearchButton />
      </section>

      <ResearchResults />

      <FinalList />
    </main>
  );
}
