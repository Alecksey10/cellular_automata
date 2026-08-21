import type { RenderData } from "../contract/types/render";
import type { EventBus } from "../runtime/EventBus";

/**
 * Интерфейс рендерера.
 * Рендерер — изолированный визуальный компонент, который:
 *   1. Подписывается на "render:data" в EventBus
 *   2. Получает RenderData от автомата
 *   3. Отрисовывает их в свой контейнер (canvas, WebGL, DOM, ...)
 */
export interface IRenderer {
  /** Подписаться на события шины */
  attach(eventBus: EventBus): void;

  /** Отписаться */
  detach(): void;

  /** Отрисовать кадр (можно вызывать и напрямую, без шины) */
  draw(data: RenderData): void;

  /** Изменить размер контейнера */
  resize(width: number, height: number): void;

  /** Очистить ресурсы */
  destroy(): void;
}