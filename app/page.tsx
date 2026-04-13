import KeywordInput from "@/components/KeywordInput";
import KeywordChips from "@/components/KeywordChips";
import SuggestionCards from "@/components/SuggestionCards";
import RegionSelector from "@/components/RegionSelector";
import ResearchButton from "@/components/ResearchButton";
import ResearchResults from "@/components/ResearchResults";
import FinalList from "@/components/FinalList";
import ErrorDisplay from "@/components/ErrorDisplay";
import SavedResearches from "@/components/SavedResearches";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <section className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          YouTube Research Tool
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Research competitors by keywords and discover top-performing videos
        </p>
      </section>

      <section className="mb-6 space-y-4">
        <KeywordInput />
        <KeywordChips />
        <SuggestionCards />
      </section>

      <section className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <RegionSelector />
        </div>
        <ErrorDisplay />
        <ResearchButton />
      </section>

      <SavedResearches />

      <ResearchResults />

      <FinalList />
    </main>
  );
}
