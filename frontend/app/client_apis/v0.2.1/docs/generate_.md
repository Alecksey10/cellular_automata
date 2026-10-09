# Клеточные автоматы API v0.2
Пиши автомат как самостоятельный TypeScript-класс. Он не должен зависеть от React, Canvas, GUI или runtime-компонентов.
## 1. Главный интерфейс
```ts
interface IAutomaton {
  getApiVersion(): string;
  getConfigSchema(): ConfigSchema;
  getConfig(): Record<string, unknown>;
  setConfig(params: Record<string, unknown>): ConfigSchema | null;
  init(context: AutomatonContext): void;
  iterate(ctx: IterationContext): void;
  render(): RenderData | null;
  runAction(actionId: string, payload?: unknown): void;
  destroy(): void;
}
```
Жизненный цикл:
```text
constructor
→ getApiVersion()
→ getConfigSchema()
→ getConfig()
→ init()
→ iterate() / render()
→ setConfig() / runAction()
→ destroy()
```
---
## 2. ConfigSchema
```ts
interface ConfigSchema {
  name: string;
  description: string;
  apiVersion: string;
  params: Record<string, ParamDef>;
  actions: Record<string, ActionDef>;
}
```
`params` — настройки автомата.
`actions` — кнопки/команды.
```ts
interface ParamDef {
  type: "number" | "string" | "boolean";
  default: number | string | boolean;
  label?: string;
  description?: string;
  ui:
    | "scroller"
    | "input"
    | "combobox"
    | "checkbox"
    | "radio";
    options?: string[];
  min?: number;
  max?: number;
  step?: number;
  editable?: boolean;
}
interface ActionDef {
  label: string;
  description?: string;
}
```
Соответствие UI:
```text
scroller  → числовой слайдер
input     → поле ввода
combobox  → список
checkbox  → boolean
radio     → выбор одного варианта
```
`options` используется для `combobox` и `radio`.
---
## 3. getApiVersion()
```ts
getApiVersion(): string {
  return "0.2";
}
```
---
## 4. getConfigSchema()
Возвращает полную декларативную схему GUI и параметров.
Пример:
```ts
{
  name: "Forest",
  description: "Горящий лес",
  apiVersion: "0.2",
  params: {
    density: {
      type: "number",
      default: 0.7,
      ui: "scroller",
      min: 0,
      max: 1,
      step: 0.01
    },
    palette: {
      type: "string",
      default: "natural",
      ui: "radio",
      options: ["natural", "contrast", "mono"]
    }
  },
  actions: {
    ignite: {
      label: "Поджечь"
    },
    reset: {
      label: "Сбросить"
    }
  }
}
```
---
## 5. getConfig()
Возвращает **текущие** значения:
```ts
getConfig(): Record<string, unknown>
```
Например:
```ts
{
  density: 0.7,
  palette: "natural"
}
```
---
## 6. setConfig()
```ts
setConfig(
  params: Record<string, unknown>
): ConfigSchema | null
```
Должен:
1. проверить входные значения;
2. применить их;
3. при необходимости изменить внутреннее состояние;
4. вернуть новую `ConfigSchema`, если изменилась структура GUI;
5. иначе вернуть `null`.
Например, изменение размера мира должно привести к перестроению массивов.
---
## 7. init()
```ts
interface AutomatonContext {
  gridWidth: number;
  gridHeight: number;
  runtime: IRuntimeCallback;
}
init(context: AutomatonContext): void;
```
Используется для первоначального создания состояния:
```ts
this.width = context.gridWidth;
this.height = context.gridHeight;
this.runtime = context.runtime;
this.cells = new Uint8Array(
  this.width * this.height
);
```
---
## 8. iterate()
```ts
interface IterationContext {
  step: number;
  time: number;
  deltaTime: number;
}
iterate(ctx: IterationContext): void;
```
Это главный шаг симуляции.
Здесь рассчитывается следующее состояние мира.
Для обычного клеточного автомата использовать двойную буферизацию:
```text
cells
  ↓
расчёт
  ↓
nextCells
  ↓
swap
```
Для состояния обычно использовать typed arrays:
```ts
Uint8Array
Uint16Array
Uint32Array
Float32Array
```
---
## 9. render()
```ts
render(): RenderData | null;
```
Не рисует Canvas напрямую.
Возвращает данные renderer:
```ts
interface GridRenderData {
  type: "grid";
  width: number;
  height: number;
  cells: Uint8Array | Uint32Array;
  palette?: string[];
}
interface RawBytesRenderData {
  type: "raw";
  width: number;
  height: number;
  data: Uint8ClampedArray;
}
type RenderData =
  | GridRenderData
  | RawBytesRenderData;
```
Для обычного автомата предпочтителен:
```ts
{
  type: "grid",
  width,
  height,
  cells,
  palette
}
```
`Uint8Array` обычно содержит индексы состояний:
```text
0 → пусто
1 → дерево
2 → огонь
3 → пепел
```
---
## 10. runAction()
```ts
runAction(
  actionId: string,
  payload?: unknown
): void
```
Обрабатывает действия из `schema.actions`.
Пример:
```ts
runAction(actionId: string): void {
  switch (actionId) {
    case "ignite":
      this.ignite();
      break;
      case "reset":
      this.reset();
      break;
  }
}
```
Действия подходят для событий:
```text
reset
clear
ignite
rain
lightning
regrow
newWorld
```
Постоянные настройки должны быть параметрами, а не actions.
---
## 11. Runtime callback
```ts
interface IRuntimeCallback {
  emitEvent(event: AutomatonEvent): void;
  requestStop(): void;
  requestPause(): void;
  requestSpeedChange(factor: number): void;
  requestRenderIntervalChange(n: number): void;
}
interface AutomatonEvent {
  type:
    | "info"
    | "warning"
    | "error"
    | "request";
    message: string;
  data?: unknown;
}
```
Использование:
```ts
this.runtime.emitEvent({
  type: "info",
  message: "Начался дождь"
});
```
Автомат не должен напрямую управлять GUI.
---
## 12. destroy()
```ts
destroy(): void;
```
Освобождает ресурсы:
* массивы;
* таймеры;
* подписки;
* дополнительные структуры.
После `destroy()` автомат не должен продолжать работу.
---
## 13. Правила хорошего автомата
Автомат должен:
* реализовывать весь `IAutomaton`;
* быть независимым от React/Canvas;
* хранить состояние отдельно от конфигурации;
* валидировать `setConfig()`;
* использовать двойную буферизацию;
* не изменять состояние в `render()`;
* возвращать корректные размеры в `render()`;
* обрабатывать все actions из своей схемы;
* использовать `runtime.emitEvent()` для сообщений;
* освобождать ресурсы в `destroy()`.
Главная ответственность автомата:
```text
конфигурация
+
состояние мира
+
правила перехода
+
actions
+
данные для renderer
```
Runtime отвечает за исполнение, GUI и отображение.
---
## 14. Минимальный шаблон
```ts
export default class MyAutomaton implements IAutomaton {
  private width = 0;
  private height = 0;
  private cells = new Uint8Array();
  private nextCells = new Uint8Array();
  private runtime: IRuntimeCallback | null = null;
  getApiVersion() {
    return "0.2";
  }
  getConfigSchema(): ConfigSchema {
    // schema
  }
  getConfig(): Record<string, unknown> {
    // current config
  }
  setConfig(params: Record<string, unknown>) {
    // validate + apply
    return null;
  }
  init(context: AutomatonContext) {
    // allocate state
  }
  iterate(ctx: IterationContext) {
    // calculate next state
  }
  render(): RenderData | null {
    // return current world
  }
  runAction(actionId: string, payload?: unknown) {
    // execute action
  }
  destroy() {
    // release resources
  }
}
```
Это основной контракт, которого достаточно для написания совместимого клеточного автомата v0.2.
Исходная спецификация API содержит эти интерфейсы и жизненный цикл автомата.