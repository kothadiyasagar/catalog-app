import { useEffect, useRef, useState } from 'react';

export function useLocalStorage(key, initialValue) {
	const isFirstLoadRef = useRef(true);
	const [storedValue, setStoredValue] = useState(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		if (isFirstLoadRef.current) {
			isFirstLoadRef.current = false;
			return;
		}
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch {}
	}, [key, storedValue]);

	return [storedValue, setStoredValue];
}


