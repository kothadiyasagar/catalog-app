import './App.css';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ItemCard } from './components/ItemCard';
import { Controls } from './components/Controls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebouncedValue } from './hooks/useDebouncedValue';

function App() {
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const [search, setSearch] = useState('');
	const debouncedSearch = useDebouncedValue(search, 300);
	const [category, setCategory] = useState('all');
	const [sortBy, setSortBy] = useState('price');
	const [sortDir, setSortDir] = useState('asc');
	const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(9);

	const [favourites, setFavourites] = useLocalStorage('favourites:v1', []);

	useEffect(() => {
		setIsLoading(true);
		const id = setTimeout(async () => {
			try {
				const res = await fetch('/items.json', { cache: 'no-store' });
				if (!res.ok) throw new Error('Failed to load data');
				const data = await res.json();
				setItems(data);
				setError(null);
			} catch (e) {
				setError(e.message || 'Error loading data');
			} finally {
				setIsLoading(false);
			}
		}, 600);
		return () => clearTimeout(id);
	}, []);

	const categories = useMemo(() => {
		const set = new Set(items.map((i) => i.category));
		return Array.from(set).sort();
	}, [items]);

	const filtered = useMemo(() => {
		const q = debouncedSearch.trim().toLowerCase();
		let list = items.filter((i) => (category === 'all' ? true : i.category === category));
		if (q) list = list.filter((i) => i.name.toLowerCase().includes(q));
		if (showFavouritesOnly) list = list.filter((i) => favourites.includes(i.id));
		const dir = sortDir === 'asc' ? 1 : -1;
		list = [...list].sort((a, b) => {
			const av = sortBy === 'price' ? a.price : a.rating;
			const bv = sortBy === 'price' ? b.price : b.rating;
			return av === bv ? 0 : av > bv ? dir : -dir;
		});
		return list;
	}, [items, debouncedSearch, category, sortBy, sortDir, showFavouritesOnly, favourites]);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / pageSize)), [filtered.length, pageSize]);
	const pageClamped = useMemo(() => Math.min(page, totalPages), [page, totalPages]);
	
	const paged = useMemo(() => {
		const start = (pageClamped - 1) * pageSize;
		return filtered.slice(start, start + pageSize);
	}, [filtered, pageClamped, pageSize]);

	useEffect(() => { setPage(1); }, [debouncedSearch, category, sortBy, sortDir, showFavouritesOnly, pageSize]);

	// Memoized callback functions to prevent unnecessary re-renders
	const toggleFavourite = useCallback((id) => {
		setFavourites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	}, [setFavourites]);

	const handleSearch = useCallback((value) => {
		setSearch(value);
	}, []);

	const handleCategory = useCallback((value) => {
		setCategory(value);
	}, []);

	const handleSortBy = useCallback((value) => {
		setSortBy(value);
	}, []);

	const handleSortDir = useCallback((value) => {
		setSortDir(value);
	}, []);

	const handleToggleFavouritesOnly = useCallback(() => {
		setShowFavouritesOnly((v) => !v);
	}, []);

	const handlePageSize = useCallback((value) => {
		setPageSize(parseInt(value));
	}, []);

	const handlePrevPage = useCallback(() => {
		setPage((p) => Math.max(1, p - 1));
	}, []);

	const handleNextPage = useCallback(() => {
		setPage((p) => Math.min(totalPages, p + 1));
	}, [totalPages]);

	// Memoized favourites lookup for better performance
	const favouritesSet = useMemo(() => new Set(favourites), [favourites]);

	return (
		<div className="container">
			<div className="header">
				<h1 className="title">Catalog</h1>
			</div>
			<Controls
				search={search}
				onSearch={handleSearch}
				categories={categories}
				category={category}
				onCategory={handleCategory}
				sortBy={sortBy}
				sortDir={sortDir}
				onSortBy={handleSortBy}
				onSortDir={handleSortDir}
				showFavouritesOnly={showFavouritesOnly}
				onToggleFavouritesOnly={handleToggleFavouritesOnly}
			/>

			{isLoading && (
				<div className="loading" role="status" aria-live="polite">
					<span className="spinner" aria-hidden></span>
					<span className="sr-only">Loading items…</span>
				</div>
			)}
			{error && !isLoading && <div className="empty" role="alert">{error}</div>}

			{!isLoading && !error && (
				<>
					<div className="toolbar" aria-live="polite">Showing {filtered.length} result(s)</div>
					{filtered.length === 0 ? (
						<div className="empty">No items match your filters. Try adjusting search or category.</div>
					) : (
						<>
							<div className="grid" role="list">
								{paged.map((item) => (
									<ItemCard 
										key={item.id} 
										item={item} 
										isFavourite={favouritesSet.has(item.id)} 
										onToggleFavourite={toggleFavourite} 
									/>
								))}
							</div>
							<div className="pagination-container">
								<div className="pagination" role="navigation" aria-label="Pagination">
									<div className="page-size-selector">
										<label className="page-size-label">
											<span>Per Page:</span>
											<select
												value={pageSize}
												onChange={(e) => handlePageSize(e.target.value)}
												aria-label="Items per page"
											>
												<option value={10}>10</option>
												<option value={20}>20</option>
												<option value={30}>30</option>
												<option value={50}>50</option>
											</select>
										</label>
									</div>
									<button onClick={handlePrevPage} disabled={pageClamped === 1} aria-label="Previous page">Prev</button>
									<span>Page {pageClamped} of {totalPages}</span>
									<button onClick={handleNextPage} disabled={pageClamped === totalPages} aria-label="Next page">Next</button>
								</div>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}

export default App;
