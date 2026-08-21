export interface RenderData {
    type: string;
    data: unknown;

    /**
     * Размер визуализируемой области.
     *
     * Может совпадать с размером карты автомата,
     * но это не обязательно.
     */
    width: number;
    height: number;

    iteration: number;
}