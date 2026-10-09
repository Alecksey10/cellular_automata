/**
 * Данные для рендеринга, которые автомат возвращает из render().
 * RUNTIME передаёт их рендереру через EventBus ("render:data").
 */
export type RenderData = GridRenderData | RawBytesRenderData;

/**
 * Сетка состояний ячеек.
 * Самый распространённый формат для клеточных автоматов.
 *
 * Рендерер отрисовывает каждую ячейку как прямоугольник,
 * используя palette для маппинга значение → цвет.
 */
export interface GridRenderData {
  type: "grid";

  /** Ширина сетки в ячейках */
  width: number;

  /** Высота сетки в ячейках */
  height: number;

  /**
   * Состояния ячеек, row-major порядок.
   * Длина = width × height.
   *
   * Uint8Array  → до 256 состояний (1 байт на ячейку)
   * Uint32Array → до 2^32 состояний (4 байта на ячейку, для ARGB-цветов)
   */
  cells: Uint8Array | Uint32Array;

  /**
   * Палитра цветов для маппинга индекс → CSS-цвет.
   * cells[i] = 2 → palette[2] = "#ff5a24"
   *
   * Если не указана — рендерер использует дефолтную палитру.
   * Если cells = Uint32Array — палитра игнорируется,
   * значения интерпретируются как ARGB-цвета напрямую.
   */
  palette?: string[];
}

/**
 * Сырые RGBA-пиксели, готовые для ImageData.
 * Для автоматов, которые сами считают цвета (например, Game of Life с градиентами).
 *
 * Длина data = width × height × 4.
 */
export interface RawBytesRenderData {
  type: "raw";

  /** Ширина изображения в пикселях */
  width: number;

  /** Высота изображения в пикселях */
  height: number;

  /**
   * RGBA-данные, row-major.
   * Готово для: new ImageData(data, width, height)
   */
  data: Uint8ClampedArray;
}