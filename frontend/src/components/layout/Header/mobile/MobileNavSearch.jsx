import React from "react";
import { HeaderSearchForm } from "../HeaderSearchForm";

export function MobileNavSearch({
  query,
  setQuery,
  onSubmit,
  onKeyDown,
  onBlur,
  t,
  suggestions,
  showSuggestions,
  onSelectSuggestion,
  activeIndex
}) {
  return (
    <div className="px-6 py-4">
      <HeaderSearchForm
        value={query} onChange={(e) => setQuery(e.target.value)}
        onSubmit={onSubmit} onKeyDown={onKeyDown} onBlur={onBlur}
        placeholder={t("header.searchPlaceholder")} suggestions={suggestions}
        showSuggestions={showSuggestions} onSelectSuggestion={onSelectSuggestion}
        activeIndex={activeIndex} listboxId="mobile-search-listbox"
      />
    </div>
  );
}
