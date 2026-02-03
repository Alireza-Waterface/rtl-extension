import { useState, useEffect } from 'react';

/**
 * یک هوک برای استفاده آسان از chrome.storage.local در ری‌اکت
 * @param key کلید تنظیمات (مثلا 'isEnabled')
 * @param initialValue مقدار اولیه
 */
export function useStorage<T>(key: string, initialValue: T) {
   const [storedValue, setStoredValue] = useState<T>(initialValue);

   useEffect(() => {
      chrome.storage.local.get([key], (result) => {
         const value = result[key];
         if (value !== undefined) {
            setStoredValue(value as T);
         } else {
            chrome.storage.local.set({ [key]: initialValue });
         }
      });

      const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
         const change = changes[key];
         if (change && change.newValue !== undefined) {
            setStoredValue(change.newValue as T);
         }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
   }, [key, initialValue]);

   const setValue = (value: T) => {
      setStoredValue(value);
      chrome.storage.local.set({ [key]: value });
   };

   return [storedValue, setValue] as const;
}