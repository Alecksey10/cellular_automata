export interface ApiConfig {
    baseUrl: string;
    staticURL: string;
}

export const apiConfig: ApiConfig = {
    baseUrl: "http://192.168.50.218:8000",
    // baseUrl: "http://localhost:8000",
    //всякая статиска, пока картинки.
    // staticURL: "http://localhost:8000",
    staticURL: "http://192.168.50.218:8000"
};