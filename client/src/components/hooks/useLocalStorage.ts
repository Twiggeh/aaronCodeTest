import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 *
 * @param key - Under what key the data will be stored
 * @param initialValue - The initial value of the stored data
 *
 * @returns - [The currently stored value in localStorage, and the setter for the currently stored value in localStorage]
 */
const useLocalStorage = <T extends unknown>(key: string, initialValue: T) => {
	const readValue = (): T => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem(key);
			if (item === 'undefined') return initialValue;
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`No value under key: "${key}"`, error);
			return initialValue;
		}
	};

	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState(readValue());

	const setValue = (value: T) => {
		try {
			const newValue = value instanceof Function ? value(storedValue) : value;
			window.localStorage.setItem(key, JSON.stringify(newValue));
			setStoredValue(newValue);
		} catch (error) {
			console.warn(`Could not set key: "${key}"`, error);
		}
	};

	useEffect(() => {
		setStoredValue(readValue());
	}, []);

	return [storedValue, setValue] as const;
};

export default useLocalStorage;
