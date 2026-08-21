import type { ConfigSchema } from "./types/config";
import type { AutomatonContext, IterationContext } from "./types/context";
import type { RenderData } from "./types/render";

/**
 * Главный интерфейс, который должен реализовать каждый автомат v0.2.
 *
 * Жизненный цикл:
 *   1. RUNTIME вызывает getConfigSchema() → генерирует UI
 *   2. RUNTIME вызывает getConfig() → заполняет UI значениями
 *   3. RUNTIME вызывает init(context) → автомат создаёт сетку
 *   4. Цикл: iterate(ctx) → render() → iterate(ctx) → render() → ...
 *   5. Пользователь меняет параметр → setConfig() → (возможно, переинициализация)
 *   6. Пользователь нажимает кнопку → runAction()
 *   7. RUNTIME вызывает destroy() → очистка ресурсов
 *
 * Пример реализации:
 * ```ts
 * class GameOfLife implements IAutomaton {
 *   private grid!: Uint8Array;
 *   private width = 0;
 *   private height = 0;
 *
 *   getApiVersion() { return "0.2"; }
 *
 *   getConfigSchema() {
 *     return {
 *       name: "Game of Life",
 *       description: "Классический клеточный автомат Конвея",
 *       apiVersion: "0.2",
 *       params: {
 *         density: { type: "number", default: 0.3, ui: "scroller", min: 0, max: 1, step: 0.05, label: "Плотность" },
 *       },
 *       actions: {
 *         randomize: { label: "Рандом" },
 *         clear: { label: "Очистить" },
 *       },
 *     };
 *   }
 *
 *   getConfig() { return { density: 0.3 }; }
 *   setConfig(p) { Object.assign(this.config, p); return null; }
 *
 *   init(ctx: AutomatonContext) {
 *     this.width = ctx.gridWidth;
 *     this.height = ctx.gridHeight;
 *     this.grid = new Uint8Array(this.width * this.height);
 *     this.randomize(0.3);
 *   }
 *
 *   iterate(ctx: IterationContext) { ... }
 *   render(): RenderData { return { type: "grid", width: this.width, height: this.height, cells: this.grid, palette: ["#101820", "#26733a"] }; }
 *   runAction(id: string) { if (id === "randomize") this.randomize(0.3); if (id === "clear") this.grid.fill(0); }
 *   destroy() { this.grid = null!; }
 * }
 *
 * export default new GameOfLife();
 * ```
 */
export interface IAutomaton {
  /**
   * Версия API, с которой совместим автомат.
   * RUNTIME использует это для выбора правильной реализации (RuntimeV02, ...).
   */
  getApiVersion(): string;

  /**
   * Вернуть полную схему конфигурации.
   * Вызывается RUNTIME:
   *   - при инициализации (для генерации UI)
   *   - после setConfig() если тот вернул новую схему
   */
  getConfigSchema(): ConfigSchema;

  /**
   * Вернуть текущие значения параметров.
   * Вызывается RUNTIME для синхронизации UI.
   */
  getConfig(): Record<string, unknown>;

  /**
   * Установить новые значения параметров.
   * Вызывается RUNTIME когда пользователь меняет что-то в ConfigPanel.
   *
   * @param params Частичный объект — только изменённые ключи.
   * @returns Новая ConfigSchema, если схема изменилась (появились/скрылись параметры).
   *          null если схема не изменилась.
   */
  setConfig(params: Record<string, unknown>): ConfigSchema | null;

  /**
   * Инициализировать автомат.
   * Вызывается один раз перед началом цикла.
   * Автомат должен создать внутренние структуры данных (сетку, буферы).
   */
  init(context: AutomatonContext): void;

  /**
   * Выполнить одну итерацию симуляции.
   * Вызывается RUNTIME в цикле, возможно несколько раз за кадр.
   * Автомат НЕ должен здесь рисовать — только обновлять состояние.
   */
  iterate(ctx: IterationContext): void;

  /**
   * Вернуть текущее состояние в виде данных для рендеринга.
   * Вызывается RUNTIME каждые renderEveryN итераций.
   *
   * @returns Данные для рендерера, или null если рендерить нечего.
   */
  render(): RenderData | null;

  /**
   * Выполнить действие (кнопку).
   * Вызывается RUNTIME когда пользователь нажимает кнопку в ConfigPanel.
   *
   * @param actionId Ключ из ConfigSchema.actions
   * @param payload Опциональные дополнительные данные
   */
  runAction(actionId: string, payload?: unknown): void;

  /**
   * Освободить ресурсы.
   * Вызывается RUNTIME при размонтировании компонента.
   */
  destroy(): void;
}