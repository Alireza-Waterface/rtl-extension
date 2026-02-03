import { useState, useEffect } from 'react';

/**
 * یک هوک برای استفاده آسان از chrome.storage.local در ری‌اکت
 * @param key کلید تنظیمات (مثلا 'isEnabled')
 * @param initialValue مقدار اولیه
 */
export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // خواندن مقدار اولیه از استوریج
    chrome.storage.local.get([key], (result) => {
      if (result[key] !== undefined) {
        setStoredValue(result[key]);
      } else {
        // اگر مقداری نبود، مقدار پیش‌فرض را ذخیره کن
        chrome.storage.local.set({ [key]: initialValue });
      }
    });

    // گوش دادن به تغییرات (اگر در تب دیگری یا جای دیگر تغییر کرد)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[key]) {
        setStoredValue(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [key, initialValue]);

  // تابع برای آپدیت کردن مقدار
  const setValue = (value: T) => {
    setStoredValue(value);
    chrome.storage.local.set({ [key]: value });
  };

  return [storedValue, setValue] as const;
}