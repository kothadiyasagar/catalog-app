import React, { useCallback } from "react";

export const Controls = React.memo(function Controls({
  search,
  onSearch,
  categories,
  category,
  onCategory,
  sortBy,
  sortDir,
  onSortBy,
  onSortDir,
  showFavouritesOnly,
  onToggleFavouritesOnly,
}) {
  const handleSearchChange = useCallback((e) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleCategoryChange = useCallback((e) => {
    onCategory(e.target.value);
  }, [onCategory]);

  const handleSortByChange = useCallback((e) => {
    onSortBy(e.target.value);
  }, [onSortBy]);

  const handleSortDirChange = useCallback((e) => {
    onSortDir(e.target.value);
  }, [onSortDir]);

  const handleFavouritesToggle = useCallback((e) => {
    onToggleFavouritesOnly();
  }, [onToggleFavouritesOnly]);

  return (
    <div className="controls" role="region" aria-label="Filters and sorting">
      <label className="control control--search">
        <span className="control__label">Search</span>
        <div className="searchbox">
          <span className="searchbox__icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="20" y1="20" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="catalog-search"
            type="search"
            placeholder="Search by name"
            value={search}
            onChange={handleSearchChange}
            aria-label="Search by name"
          />
          {/* {search && (
            <button
              type="button"
              className="searchbox__clear"
              aria-label="Clear search"
              onClick={() => onSearch("")}
            >
              ×
            </button>
          )} */}
        </div>
      </label>

      <label className="control">
        <span className="control__label">Category</span>
        <select
          value={category}
          onChange={handleCategoryChange}
          aria-label="Filter by category"
        >
          <option value="all">All</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </label>

      <label className="control">
        <span className="control__label">Sort By</span>
        <select
          value={sortBy}
          onChange={handleSortByChange}
          aria-label="Sort by field"
        >
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
      </label>

      <label className="control">
        <span className="control__label">Direction</span>
        <select
          value={sortDir}
          onChange={handleSortDirChange}
          aria-label="Sort direction"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>

      <label className="switch">
        <input
          type="checkbox"
          checked={showFavouritesOnly}
          onChange={handleFavouritesToggle}
          aria-label="Show favourites only"
        />
        <span>Favourites only</span>
      </label>
    </div>
  );
});
