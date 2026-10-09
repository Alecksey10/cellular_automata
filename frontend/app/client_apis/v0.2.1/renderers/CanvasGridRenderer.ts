import type { RenderData, GridRenderData, RawBytesRenderData } from "../contract/types/render";
import type { EventBus } from "../runtime/EventBus";
import type { IRenderer } from "./IRenderer";

/**
 * Дефолтная палитра для GridRenderData без явной palette.
 * Индекс → цвет.
 */
const DEFAULT_PALETTE = [
  "#101820", // 0 — пустота / мёртвая клетка
  "#26733a", // 1 — живая / активная
  "#ff5a24", // 2 — огонь / особое состояние
  "#3b82f6", // 3
  "#f59e0b", // 4
  "#8b5cf6", // 5
  "#ec4899", // 6
  "#14b8a6", // 7
];

/**
 * Рендерер на Canvas 2D.
 * Поддерживает оба типа RenderData: "grid" и "raw".
 *
 * Для "grid":
 *   - Каждая ячейка = прямоугольник
 *   - Цвет берётся из palette[cells[i]]
 *   - Оптимизация: группирует ячейки одного цвета в один fillRect batch
 *
 * Для "raw":
 *   - Прямая запись через putImageData (быстро, zero-copy)
 */
export class CanvasGridRenderer implements IRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private eventBus: EventBus | null = null;
  private boundDraw: (data: RenderData) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("[CanvasGridRenderer] Cannot get 2d context");
    }
    this.ctx = ctx;
    this.boundDraw = this.draw.bind(this);
  }

  attach(eventBus: EventBus): void {
    this.eventBus = eventBus;
    this.eventBus.on("render:data", this.boundDraw);
  }

  detach(): void {
    if (this.eventBus) {
      this.eventBus.off("render:data", this.boundDraw);
      this.eventBus = null;
    }
  }

  draw(data: RenderData): void {
    switch (data.type) {
      case "grid":
        this.drawGrid(data);
        break;
      case "raw":
        this.drawRaw(data);
        break;
    }
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  destroy(): void {
    this.detach();
  }

  // ─── Внутреннее ───

  private drawGrid(data: GridRenderData): void {
    const { width, height, cells, palette = DEFAULT_PALETTE } = data;
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    const scaleX = cw / width;
    const scaleY = ch / height;

    ctx.clearRect(0, 0, cw, ch);

    // Оптимизация: группируем по цвету
    // Собираем ячейки в Map<color, [x, y][]>
    const colorGroups = new Map<string, number[]>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = cells[y * width + x];
        const color = palette[value % palette.length];

        let group = colorGroups.get(color);
        if (!group) {
          group = [];
          colorGroups.set(color, group);
        }
        // Храним как плоский массив [x1,y1, x2,y2, ...] для скорости
        group.push(x, y);
      }
    }

    // Рисуем батчами по цвету
    for (const [color, coords] of colorGroups) {
      ctx.fillStyle = color;
      for (let i = 0; i < coords.length; i += 2) {
        const x = coords[i];
        const y = coords[i + 1];
        ctx.fillRect(
          x * scaleX,
          y * scaleY,
          Math.ceil(scaleX),
          Math.ceil(scaleY),
        );
      }
    }
  }

    private drawRaw(data: RawBytesRenderData): void {
    // Используем 'as any' для обхода конфликта типов SharedArrayBuffer / ArrayBuffer в DOM-типах TS
    const rawData = data.data as any;
    const imageData = new ImageData(rawData, data.width, data.height);

    // Если размеры не совпадают — масштабируем через offscreen canvas
    if (data.width === this.canvas.width && data.height === this.canvas.height) {
      this.ctx.putImageData(imageData, 0, 0);
    } else {
      const offscreen = new OffscreenCanvas(data.width, data.height);
      const offCtx = offscreen.getContext("2d")!;
      offCtx.putImageData(imageData, 0, 0);

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(offscreen, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
}