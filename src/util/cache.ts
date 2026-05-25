// Interface for the custom localStorage wrapper to handle expiration
interface ExpiredStorageItem<T> {
    value: T;
    expiry: number | null;
}

// Helper to manage Cookies with type safety
const cookieManager = {
    set: <T>(key: string, value: T, expiresSec?: number): void => {
        let expiresString = "";
        if (expiresSec) {
            const date = new Date();
            date.setTime(date.getTime() + expiresSec * 1000);
            expiresString = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}${expiresString}; path=/; SameSite=Lax`;
    },

    get: <T>(key: string): T | null => {
        const nameEQ = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length))) as T;
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }
};

// Strict Type for the options parameter
export type StorageType = 'localstorage' | 'cookies';

// Main Exported Functions
export const setData = <T>(
    key: string,
    value: T,
    expirationInSeconds?: number,
    storageType: StorageType = 'localstorage'
): void => {
    if (storageType.toLowerCase() === 'cookies') {
        cookieManager.set(key, value, expirationInSeconds);
    } else {
        // LocalStorage Logic with Expiration fallback
        const now = new Date();
        const item: ExpiredStorageItem<T> = {
            value: value,
            expiry: expirationInSeconds ? now.getTime() + (expirationInSeconds * 1000) : null,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }
};

export const getData = <T>(
    key: string,
    storageType: StorageType = 'localstorage'
): T | null => {
    if (storageType.toLowerCase() === 'cookies') {
        return cookieManager.get<T>(key);
    } else {
        // LocalStorage Logic
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
            const item: ExpiredStorageItem<T> = JSON.parse(itemStr);
            const now = new Date();

            // Check if it has an expiry and if it's passed
            if (item.expiry && now.getTime() > item.expiry) {
                localStorage.removeItem(key); // Clean up expired item
                return null;
            }

            // If it doesn't follow the custom object structure, handle it safely
            if (item && typeof item === 'object' && 'value' in item) {
                return item.value;
            }

            return itemStr as unknown as T;
        } catch (e) {
            return itemStr as unknown as T;
        }
    }
};