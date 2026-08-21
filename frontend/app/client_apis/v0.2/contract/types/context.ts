import type { IRuntimeCallback } from "../IRuntimeCallback";

/**
 * Контекст, передаваемый автомату при инициализации.
 * Содержит всё, что нужно для первого запуска.
 */
export interface AutomatonContext {
  /** Ширина сетки в ячейках */
  gridWidth: number;

  /** Высота сетки в ячейках */
  gridHeight: number;

  /**
   * Обратная связь с RUNTIME.
   * Автомат использует его для:
   *   - отправки уведомлений (emitEvent)
   *   - запроса остановки / паузы
   *   - изменения скорости и интервала рендеринга
   */
  runtime: IRuntimeCallback;
}

/**
 * Контекст, передаваемый автомату на каждой итерации.
 */
export interface IterationContext {
  /** Номер текущей итерации (начинается с 0) */
  step: number;

  /**
   * Текущее время в миллисекундах (performance.now()).
   * Абсолютное значение, полезно для анимаций.
   */
  time: number;

  /**
   * Время, прошедшее с предыдущей итерации (мс).
   * Учитывает speed-множитель RUNTIME.
   * Полезно для frame-independent симуляций.
   */
  deltaTime: number;
}