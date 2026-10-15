export interface ApiConfig {
    baseUrl: string;
    staticURL: string;
}

// Базовый адрес API задаётся через переменную окружения
// VITE_API_BASE_URL (см. .env.example). Локально по умолчанию — localhost.
const defaultBaseUrl = "http://localhost:8000";

const baseUrl: string =
    import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

export const apiConfig: ApiConfig = {
    baseUrl,
    //всякая статиска, пока картинки.
    staticURL: baseUrl,
};
