import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import { ItemCard } from './components/ItemCard';
import { Controls } from './components/Controls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebouncedValue } from './hooks/useDebouncedValue';

const PAGE_SIZE = 9;

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

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const pageClamped = Math.min(page, totalPages);
	const paged = useMemo(() => {
		const start = (pageClamped - 1) * PAGE_SIZE;
		return filtered.slice(start, start + PAGE_SIZE);
	}, [filtered, pageClamped]);

	useEffect(() => { setPage(1); }, [debouncedSearch, category, sortBy, sortDir, showFavouritesOnly]);

	const toggleFavourite = (id) => {
		setFavourites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
	};

	return (
		<div className="container">
			<div className="header">
				<h1 className="title">Catalog</h1>
			</div>
			<Controls
				search={search}
				onSearch={setSearch}
				categories={categories}
				category={category}
				onCategory={setCategory}
				sortBy={sortBy}
				sortDir={sortDir}
				onSortBy={setSortBy}
				onSortDir={setSortDir}
				showFavouritesOnly={showFavouritesOnly}
				onToggleFavouritesOnly={() => setShowFavouritesOnly((v) => !v)}
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
									<ItemCard key={item.id} item={item} isFavourite={favourites.includes(item.id)} onToggleFavourite={toggleFavourite} />
								))}
							</div>
							<div className="pagination" role="navigation" aria-label="Pagination">
								<button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageClamped === 1} aria-label="Previous page">Prev</button>
								<span>Page {pageClamped} of {totalPages}</span>
								<button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageClamped === totalPages} aria-label="Next page">Next</button>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
}

export default App;
