
# Документация API v0.2 — Клеточные автоматы

---

## Оглавление

1. [Обзор архитектуры](#1-обзор-архитектуры)
2. [Отношения между классами](#2-отношения-между-классами)
3. [Контракт автомата (`contract/`)](#3-контракт-автомата)
4. [Система исполнения (`runtime/`)](#4-система-исполнения)
5. [Визуализация (`renderers/`)](#5-визуализация)
6. [Оркестрация (`engine/`)](#6-оркестрация)
7. [GUI-компоненты (`gui/`)](#7-gui-компоненты)
8. [Написание автомата: пошаговое руководство](#8-написание-автомата)
9. [Жизненный цикл системы](#9-жизненный-цикл-системы)

---

## 1. Обзор архитектуры

### 1.1. Три слоя системы

Система построена на трёх изолированных слоях, взаимодействующих через строго определённые интерфейсы:

```text
┌─────────────────────────────────────────────────────────────────┐
│  GUI Layer (React-компоненты)                                   │
│  Только отображение и ввод пользователя.                        │
│  Не знает о внутренностях автомата.                             │
│  Подписывается на EventBus и вызывает методы Engine.            │
├─────────────────────────────────────────────────────────────────┤
│  RUNTIME Layer (Engine + Runtime + Loop + Renderer)             │
│  Управляет жизненным циклом автомата.                           │
│  Владеет циклом итераций, рендерингом, шиной событий.           │
│  Является единственным посредником между GUI и автоматом.       │
├─────────────────────────────────────────────────────────────────┤
│  Automaton Layer (пользовательский код)                         │
│  Реализует интерфейс IAutomaton.                                │
│  Загружается как строка с сервера, компилируется в браузере.    │
│  Не имеет доступа к DOM, canvas, React, шине событий.           │
│  Взаимодействует со средой только через IRuntimeCallback.       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Принципы проектирования

| Принцип | Как реализован |
|---------|---------------|
| **Изоляция** | Автомат не знает о DOM, React, canvas. Он оперирует только массивами данных и вызывает методы `IRuntimeCallback`. |
| **Однонаправленные зависимости** | `GUI → Engine → Runtime → Automaton`. Автомат **никогда** не импортирует ничего из верхних слоёв. |
| **Обратная связь через callback** | Автомат влияет на среду только через объект `IRuntimeCallback`, переданный ему при `init()`. |
| **Декларативная конфигурация** | Автомат описывает свои параметры и действия в `ConfigSchema`. GUI генерируется автоматически из этой схемы. |
| **Версионность** | Каждая версия API (`v0.1`, `v0.2`, ...) — самодостаточная директория с собственным контрактом, runtime, GUI. |

---

## 2. Отношения между классами

Это ключевой раздел. Здесь описано, **кто кого создаёт**, **кто кем владеет**, **кто с кем общается** и **через какие механизмы**.

### 2.1. Диаграмма владения (кто создаёт кого)

```text
React Router
  │
  │  создаёт
  ▼
AutomatonView (React-компонент)
  │
  │  вызывает хук
  ▼
useAutomatonEngine (React hook)
  │
  │  создаёт (в useEffect #1)         создаёт (в useEffect #2)
  ├──────────────────────────┐     ┌──────────────────────────┐
  │                          ▼     ▼                          │
  │                    AutomatonEngine ◄──────────────────────┘
  │                          │
  │              ┌───────────┼───────────┐
  │              │           │           │
  │         создаёт     создаёт     создаёт
  │              ▼           ▼           ▼
  │         EventBus    RuntimeV02   CanvasGridRenderer
  │                         │
  │                    создаёт
  │                         ▼
  │                   LoopController
  │                         │
  │                    создаёт
  │                         ▼
  │                   RuntimeParams
  │
  │  loadProgram() (в useEffect #1)
  │         │
  │         ▼
  │    IAutomaton (инстанс из пользовательского кода)
  │
  │  React рендерит
  ├─────────────────┐
  │                 ▼
  │          AutomatonHeader
  │          ControlPanel
  │          ConfigPanel
  │          EventLogPanel
  │          <canvas>
  └─────────────────┘
```

### 2.2. Таблица владения

| Владелец | Создаёт | Владеет (уничтожает) |
|----------|---------|---------------------|
| **`useAutomatonEngine`** | `AutomatonEngine`, `IAutomaton` (через `loadProgram`) | Да. Вызывает `engine.destroy()` в cleanup `useEffect`. |
| **`AutomatonEngine`** | `EventBus`, `RuntimeV02`, `CanvasGridRenderer` | Да. Вызывает `destroy()` на всех трёх в своём `destroy()`. |
| **`RuntimeV02`** (наследует `BaseRuntimeProgram`) | `LoopController`, `RuntimeParams`, `IRuntimeCallback` (объект) | Да. Управляет `LoopController` (start/stop/pause). |
| **`LoopController`** | Ничего | Нет. Получает callback-функции `onTick` и `onRender` при создании. |
| **`CanvasGridRenderer`** | Ничего | Нет. Получает ссылку на `<canvas>` при создании. |
| **`EventBus`** | Ничего | Нет. Чистый контейнер подписок. |
| **React-компоненты** | Ничего из runtime-слоя | Нет. Только подписываются на `EventBus` и вызывают методы через props. |

### 2.3. Диаграмма коммуникаций (кто с кем и как общается)

```text
┌──────────────┐     props/callbacks     ┌──────────────────┐
│ ControlPanel │ ◄─────────────────────► │ useAutomaton      │
│ ConfigPanel  │  onStart, onPause,      │ Engine (hook)     │
│ EventLogPanel│  onStep, setParam,      │                   │
│              │  runAction              │ Хранит ref на     │
│              │                         │ AutomatonEngine   │
└──────┬───────┘                         └────────┬──────────┘
       │                                          │
       │ EventBus.on(...)                         │ engine.start()
       │ (подписка на события)                    │ engine.setParam()
       │                                          │ engine.runAction()
       ▼                                          ▼
┌──────────────────────────────────────────────────────────────┐
│                        EventBus                              │
│                                                              │
│  Каналы:                                                     │
│    "render:data"     → RenderData (runtime → renderer)       │
│    "automaton:event" → AutomatonEvent (runtime → GUI)        │
│    "config:changed"  → {key, value, newSchema} (runtime→GUI) │
│    "schema:changed"  → ConfigSchema (runtime → GUI)          │
│    "runtime:state"   → "started"|"paused"|"stopped" (→GUI)   │
│    "iteration:tick"  → number (runtime → GUI)                │
│                                                              │
└───────▲──────────────────────────────────────▲───────────────┘
        │                                      │
        │ emit(...)                            │ on("render:data")
        │                                      │
┌───────┴──────────┐                   ┌───────┴──────────────┐
│  BaseRuntime      │                   │ CanvasGridRenderer   │
│  Program          │                   │                      │
│                   │                   │ Подписан на шину.    │
│  Вызывает         │                   │ Получает RenderData. │
│  automaton.       │                   │ Рисует на canvas.    │
│  iterate()        │                   │                      │
│  automaton.       │                   │ Не знает о runtime,  │
│  render()         │                   │ автомате, GUI.       │
│                   │                   │                      │
└───────┬───────────┘                   └──────────────────────┘
        │
        │ вызывает методы IAutomaton
        │ передаёт IRuntimeCallback
        ▼
┌───────────────────┐
│    IAutomaton      │
│ (пользовательский  │
│  код автомата)     │
│                    │
│ Получает:          │
│  - IterationContext│
│  - AutomatonContext│
│    (с runtime cb)  │
│                    │
│ Возвращает:        │
│  - RenderData      │
│  - ConfigSchema    │
│                    │
│ Вызывает:          │
│  - runtime.        │
│    emitEvent()     │
│  - runtime.        │
│    requestStop()   │
│  - runtime.        │
│    requestPause()  │
│  - runtime.        │
│    requestSpeed    │
│    Change()        │
└────────────────────┘
```

### 2.4. Правила взаимодействия

#### Правило 1: GUI → Engine (только через методы хука)

GUI-компоненты **никогда** не обращаются к `BaseRuntimeProgram`, `LoopController`, `IAutomaton` напрямую. Все взаимодействия идут через методы, возвращённые хуком `useAutomatonEngine`:

```text
Кнопка "Старт" → onClick → engine.start()
Слайдер "Скорость" → onChange → engine.setSpeed(2.0)
Виджет конфига → onChange → engine.setParam("density", 0.5)
Кнопка действия → onClick → engine.runAction("randomize")
```

#### Правило 2: Engine → GUI (только через React-стейт и EventBus)

Engine обновляет GUI двумя способами:
- **React-стейт**: `setIteration(step)`, `setIsRunning(true)`, `setParams({...})`, `setSchema({...})` — вызываются в callback'ах, переданных в `AutomatonEngine`.
- **EventBus**: для компонентов, которые подписываются напрямую (например, `EventLogPanel` слушает `"automaton:event"`).

#### Правило 3: Runtime → Automaton (только через методы IAutomaton)

`BaseRuntimeProgram` вызывает строго определённые методы автомата:

| Когда | Что вызывает |
|-------|-------------|
| При первом запуске | `getConfigSchema()`, `getConfig()`, `init(context)` |
| Каждый тик цикла | `iterate(ctx)` |
| Каждые N тиков | `render()` |
| При смене параметра из GUI | `setConfig({key: value})` |
| При нажатии кнопки действия | `runAction(actionId)` |
| При остановке/сбросе | `destroy()` |

#### Правило 4: Automaton → Runtime (только через IRuntimeCallback)

Автомат **не имеет ссылки** на `BaseRuntimeProgram`, `EventBus`, `LoopController`. Единственный способ влиять на среду — объект `IRuntimeCallback`, переданный в `init(context)`:

```ts
// Внутри автомата:
this.runtime.emitEvent({ type: "info", message: "Генерация завершена!" });
this.runtime.requestPause();
this.runtime.requestSpeedChange(0.5);
this.runtime.requestRenderIntervalChange(5);
this.runtime.requestStop();
```

#### Правило 5: Renderer изолирован от всех

`CanvasGridRenderer`:
- **Не знает** об автомате, runtime, GUI.
- **Подписан** на `EventBus` канал `"render:data"`.
- **Получает** `RenderData` и рисует.
- **Может быть заменён** на WebGL-рендерер, SVG-рендерер и т.д. без изменения остального кода.

### 2.5. Что НЕ ДОЛЖНО происходить

| Нарушение | Почему плохо |
|-----------|-------------|
| GUI-компонент импортирует `BaseRuntimeProgram` | Жёсткая связь. При смене версии API придётся менять GUI. |
| Автомат импортирует `EventBus` | Нарушение изоляции. Автомат не должен знать о системе событий. |
| `LoopController` вызывает методы `IAutomaton` напрямую | Он не знает о существовании автомата. Работает только с callback'ами `onTick` и `onRender`. |
| `CanvasGridRenderer` вызывает `automaton.render()` | Он не знает о существовании автомата. Получает данные по шине. |
| Автомат хранит ссылку на `canvas` | Автомат не рендерит. Он возвращает данные. |

### 2.6. Порядок создания и уничтожения

#### Создание (сверху вниз):

```text
1. useAutomatonEngine (React hook)
   │
   ├─ useEffect #1: загрузка
   │   ├─ APIMethodGetAutomataByID.execute() → исходный код
   │   ├─ loadProgram(source) → IAutomaton (инстанс)
   │   ├─ setProgram(program) → триггерит ререндер
   │   └─ setSchema(), setParams() → GUI получает данные
   │
   └─ useEffect #2: инициализация (срабатывает когда program !== null)
       └─ new AutomatonEngine(program, canvas, callbacks)
            │
            ├─ new EventBus()
            │
            ├─ new CanvasGridRenderer(canvas)
            │   └─ renderer.attach(eventBus) → подписка на "render:data"
            │
            └─ new RuntimeV02(automaton, eventBus, params)
                 │
                 ├─ new RuntimeParams()
                 │
                 ├─ createRuntimeCallback() → объект IRuntimeCallback
                 │
                 └─ new LoopController(params, onTick, onRender)
```

#### Уничтожение (снизу вверх):

```text
useEffect cleanup (при размонтировании или смене automatonId)
  │
  └─ engine.destroy()
       │
       ├─ runtime.destroy()
       │    ├─ loop.stop() → cancelAnimationFrame
       │    └─ automaton.destroy() → освобождение памяти автомата
       │
       ├─ renderer.destroy()
       │    └─ renderer.detach() → отписка от EventBus
       │
       └─ eventBus.clear() → удаление всех подписок
```

---

## 3. Контракт автомата

### 3.1. `IAutomaton` — главный интерфейс

Каждый автомат v0.2 **обязан** реализовать все методы этого интерфейса. Автомат загружается как строка кода с сервера, компилируется через `loadProgram()`, и из него создаётся инстанс через `new`.

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

#### Описание каждого метода:

| Метод | Когда вызывается | Что делает | Что возвращает |
|-------|-----------------|------------|---------------|
| `getApiVersion()` | При загрузке, до `init` | Сообщает версию API | `"0.2"` |
| `getConfigSchema()` | При загрузке, до `init` | Описывает параметры и действия | `ConfigSchema` |
| `getConfig()` | При загрузке и после `setConfig` | Текущие значения параметров | `Record<string, unknown>` |
| `setConfig(params)` | При изменении параметра в GUI | Применяет новые значения | `ConfigSchema \| null` (если схема изменилась) |
| `init(context)` | Один раз перед запуском цикла | Создаёт внутренние структуры (сетку, буферы) | `void` |
| `iterate(ctx)` | Каждый тик цикла (может быть несколько раз за кадр) | Обновляет состояние симуляции | `void` |
| `render()` | Каждые `renderEveryN` итераций | Возвращает данные для отрисовки | `RenderData \| null` |
| `runAction(actionId)` | При нажатии кнопки действия в GUI | Выполняет именованное действие | `void` |
| `destroy()` | При остановке / размонтировании | Освобождает ресурсы | `void` |

### 3.2. `IRuntimeCallback` — обратная связь автомата со средой

Передаётся автомату внутри `AutomatonContext` при вызове `init()`. Автомат сохраняет ссылку и использует её для влияния на среду исполнения.

```ts
interface IRuntimeCallback {
  emitEvent(event: AutomatonEvent): void;
  requestStop(): void;
  requestPause(): void;
  requestSpeedChange(factor: number): void;
  requestRenderIntervalChange(n: number): void;
}
```

| Метод | Когда использовать | Эффект |
|-------|-------------------|--------|
| `emitEvent({type, message})` | Уведомление пользователя | Отображается в `EventLogPanel`. Если `type === "error"` — автоматическая пауза. |
| `requestStop()` | Симуляция должна полностью остановиться | `LoopController.stop()`. Цикл прекращается. |
| `requestPause()` | Симуляция должна встать на паузу | `LoopController.pause()`. Можно возобновить. |
| `requestSpeedChange(factor)` | Автомат хочет изменить скорость | `RuntimeParams.speed = factor`. |
| `requestRenderIntervalChange(n)` | Автомат хочет изменить частоту рендеринга | `RuntimeParams.renderEveryN = n`. |

### 3.3. `AutomatonContext` — контекст инициализации

```ts
interface AutomatonContext {
  gridWidth: number;        // ширина сетки в ячейках
  gridHeight: number;       // высота сетки в ячейках
  runtime: IRuntimeCallback; // обратная связь со средой
}
```

Передаётся автомату **один раз** при вызове `init()`. Автомат должен:
1. Сохранить `runtime` для последующих вызовов.
2. Использовать `gridWidth` и `gridHeight` для создания своих массивов данных.

### 3.4. `IterationContext` — контекст итерации

```ts
interface IterationContext {
  step: number;      // номер итерации (начинается с 1)
  time: number;      // текущее время (performance.now(), мс)
  deltaTime: number; // время одного шага (мс), учитывает speed
}
```

Передаётся в `iterate()` на каждом тике.

### 3.5. `ConfigSchema` — декларативная схема конфигурации

```ts
interface ConfigSchema {
  name: string;                          // имя автомата (отображается в заголовке)
  description: string;                   // описание (отображается под заголовком)
  apiVersion: string;                    // "0.2"
  params: Record<string, ParamDef>;      // параметры (генерируют виджеты)
  actions: Record<string, ActionDef>;    // действия (генерируют кнопки)
}
```

#### `ParamDef` — описание параметра:

```ts
interface ParamDef {
  type: "number" | "string" | "boolean";
  default: number | string | boolean;
  label?: string;            // отображаемое имя (если нет — ключ)
  description?: string;      // подсказка
  ui: "scroller" | "input" | "combobox" | "checkbox" | "radio";
  options?: string[];         // для combobox / radio
  min?: number;               // для scroller / input number
  max?: number;
  step?: number;
  editable?: boolean;         // false → виджет заблокирован (default: true)
}
```

| Значение `ui` | Тип виджета | Требуемые поля |
|--------------|-------------|---------------|
| `"scroller"` | Слайдер | `min`, `max`, `step` |
| `"input"` | Текстовое поле | — |
| `"combobox"` | Выпадающий список | `options` |
| `"checkbox"` | Чекбокс | — |
| `"radio"` | Радиокнопки | `options` |

#### `ActionDef` — описание действия:

```ts
interface ActionDef {
  label: string;          // текст на кнопке
  description?: string;   // подсказка (tooltip)
}
```

### 3.6. `RenderData` — данные для рендеринга

```ts
type RenderData = GridRenderData | RawBytesRenderData;
```

#### `GridRenderData` — сетка состояний:

```ts
interface GridRenderData {
  type: "grid";
  width: number;
  height: number;
  cells: Uint8Array | Uint32Array;  // состояния ячеек, row-major
  palette?: string[];                // индекс → CSS-цвет
}
```

- Если `palette` не указана — используется дефолтная палитра рендерера.
- Если `cells` — `Uint32Array`, значения интерпретируются как ARGB-цвета напрямую.

#### `RawBytesRenderData` — сырые пиксели:

```ts
interface RawBytesRenderData {
  type: "raw";
  width: number;
  height: number;
  data: Uint8ClampedArray;  // RGBA, длина = width × height × 4
}
```

### 3.7. `AutomatonEvent` — события от автомата

```ts
interface AutomatonEvent {
  type: "info" | "warning" | "error" | "request";
  message: string;
  data?: unknown;
}
```

| Тип | Отображение | Побочный эффект |
|-----|------------|----------------|
| `"info"` | Синий бейдж в логе | Нет |
| `"warning"` | Жёлтый бейдж | Нет |
| `"error"` | Красный бейдж | Автоматическая пауза симуляции |
| `"request"` | Фиолетовый бейдж | Нет (зарезервировано для будущего) |

---

## 4. Система исполнения

### 4.1. `EventBus`

**Роль**: Связывает все компоненты системы без прямых зависимостей.

**Создаётся**: `AutomatonEngine`.

**Используется**: `BaseRuntimeProgram` (emit), `CanvasGridRenderer` (on), GUI-компоненты (on).

**Уничтожается**: `AutomatonEngine.destroy()` → `eventBus.clear()`.

```ts
class EventBus {
  on<T>(event: string, handler: (data: T) => void): void;
  off<T>(event: string, handler: (data: T) => void): void;
  emit<T>(event: string, data?: T): void;
  clear(): void;
}
```

#### Каналы событий:

| Канал | Данные | Направление | Назначение |
|-------|--------|------------|-----------|
| `"render:data"` | `RenderData` | Runtime → Renderer | Передача кадра для отрисовки |
| `"automaton:event"` | `AutomatonEvent` | Runtime → GUI | Уведомления от автомата |
| `"config:changed"` | `{key, value, newSchema}` | Runtime → GUI | Параметр изменён |
| `"schema:changed"` | `ConfigSchema` | Runtime → GUI | Схема UI перестроена |
| `"runtime:state"` | `"started" \| "paused" \| "stopped"` | Runtime → GUI | Смена состояния цикла |
| `"iteration:tick"` | `number` | Runtime → GUI | Номер текущей итерации |

### 4.2. `RuntimeParams`

**Роль**: Хранит параметры, управляющие средой исполнения (не автоматом).

**Создаётся**: `BaseRuntimeProgram`.

**Читается**: `LoopController` (по ссылке, на каждом тике).

```ts
class RuntimeParams {
  speed: number;                 // множитель скорости (default: 1.0)
  targetFps: number;             // целевой FPS цикла (default: 60)
  renderEveryN: number;          // рендерить каждые N итераций (default: 1)
  paused: boolean;               // пауза (default: false)
  maxIterationsPerFrame: number; // защита от спирали смерти (default: 100)
  defaultGridWidth: number;      // ширина сетки по умолчанию (default: 100)
  defaultGridHeight: number;     // высота сетки по умолчанию (default: 100)
}
```

### 4.3. `LoopController`

**Роль**: Управляет циклом `requestAnimationFrame`. Считает аккумулятор времени, вызывает callback'и `onTick` и `onRender`.

**Создаётся**: `BaseRuntimeProgram`.

**Не знает о**: `IAutomaton`, `EventBus`, `canvas`, GUI.

**Получает при создании**:
- `RuntimeParams` — читает `speed`, `targetFps`, `renderEveryN`, `maxIterationsPerFrame` на каждом кадре.
- `onTick(ctx: IterationContext)` — callback для итерации.
- `onRender()` — callback для рендеринга.

```ts
class LoopController {
  start(): void;     // запустить цикл
  stop(): void;      // полностью остановить
  pause(): void;     // пауза (сохраняет аккумулятор)
  resume(): void;    // возобновить после паузы
  stepOnce(): void;  // одна итерация + рендер (ручной шаг)
  resetStepCount(): void;  // сброс счётчика

  get isRunning(): boolean;
  get currentStep(): number;
}
```

#### Алгоритм работы цикла:

```
requestAnimationFrame(loop)
  │
  ├─ dt = timestamp - lastTimestamp
  ├─ accumulator += dt * speed
  │
  ├─ while (accumulator >= stepDuration && iterations < max):
  │     stepCount++
  │     onTick({ step, time, deltaTime })
  │     accumulator -= stepDuration
  │     iterations++
  │
  ├─ if (iterations > 0):
  │     stepsSinceRender = stepCount - lastRenderedStep
  │     if (stepsSinceRender >= renderEveryN):
  │         onRender()
  │         lastRenderedStep = stepCount
  │
  └─ requestAnimationFrame(loop)
```

### 4.4. `BaseRuntimeProgram`

**Роль**: Абстрактный базовый класс. Управляет жизненным циклом автомата. Создаёт `LoopController`, `RuntimeParams`, `IRuntimeCallback`. Является связующим звеном между автоматом и шиной событий.

**Создаётся**: `AutomatonEngine` (через наследника `RuntimeV02`).

```ts
abstract class BaseRuntimeProgram {
  // Управление жизненным циклом
  start(): void;
  pause(): void;
  stop(): void;
  step(): void;    // одна итерация + рендер
  reset(): void;   // destroy → init → start
  destroy(): void;

  // Конфигурация автомата
  setParam(key: string, value: unknown): void;
  runAction(actionId: string, payload?: unknown): void;

  // Runtime-параметры
  setSpeed(factor: number): void;
  setRenderEveryN(n: number): void;

  // Состояние
  get isRunning(): boolean;
  get currentStep(): number;

  // Абстрактные методы (реализуются в наследниках)
  abstract getApiVersion(): string;
}
```

#### Внутренняя структура:

```
BaseRuntimeProgram
  ├─ automaton: IAutomaton        (получает при создании)
  ├─ eventBus: EventBus           (получает при создании)
  ├─ params: RuntimeParams        (создаёт сам)
  ├─ loop: LoopController         (создаёт сам)
  ├─ runtimeCallback: IRuntimeCallback (создаёт сам)
  └─ initialized: boolean        (флаг инициализации)
```

### 4.5. `RuntimeV02`

**Роль**: Конкретная реализация `BaseRuntimeProgram` для API v0.2.

```ts
class RuntimeV02 extends BaseRuntimeProgram {
  getApiVersion(): string { return "0.2"; }
}
```

В будущем здесь может появиться:
- Валидация `ConfigSchema` по спецификации v0.2.
- Новые callback-методы в `IRuntimeCallback`.
- Обработка новых типов `RenderData`.

---

## 5. Визуализация

### 5.1. `IRenderer`

**Роль**: Интерфейс для любого рендерера. Позволяет заменять способ отрисовки без изменения остального кода.

```ts
interface IRenderer {
  attach(eventBus: EventBus): void;  // подписаться на "render:data"
  detach(): void;                     // отписаться
  draw(data: RenderData): void;      // отрисовать кадр
  resize(width: number, height: number): void;
  destroy(): void;
}
```

### 5.2. `CanvasGridRenderer`

**Роль**: Рендерер на Canvas 2D. Поддерживает типы `"grid"` и `"raw"`.

**Создаётся**: `AutomatonEngine`.

**Получает**: ссылку на `<canvas>` DOM-элемент.

**Подключается к**: `EventBus` через `attach()`.

#### Оптимизация рендеринга `"grid"`:
- Группирует ячейки по цвету.
- Рисует батчами: один `fillStyle` → множество `fillRect`.
- Минимизирует переключения состояния Canvas 2D контекста.

#### Рендеринг `"raw"`:
- Создаёт `ImageData` напрямую из `Uint8ClampedArray`.
- Если размеры не совпадают с canvas — масштабирует через `OffscreenCanvas`.

---

## 6. Оркестрация

### 6.1. `AutomatonEngine`

**Роль**: Единая точка управления. Создаёт и связывает `EventBus`, `RuntimeV02`, `CanvasGridRenderer`. Транслирует события из шины в React-callback'и.

**Создаётся**: `useAutomatonEngine` (React hook).

```ts
class AutomatonEngine {
  readonly eventBus: EventBus;

  constructor(
    automaton: IAutomaton,
    canvas: HTMLCanvasElement,
    callbacks: EngineCallbacks,
    paramsOverrides?: Partial<RuntimeParams>
  );

  start(): void;
  pause(): void;
  step(): void;
  reset(): void;
  setParam(key: string, value: unknown): void;
  runAction(actionId: string, payload?: unknown): void;
  setSpeed(factor: number): void;
  setRenderEveryN(n: number): void;
  destroy(): void;
}
```

#### `EngineCallbacks`:

```ts
interface EngineCallbacks {
  onIteration: (step: number) => void;
  onConfigChanged: (params: Record<string, unknown>) => void;
  onSchemaChanged?: (schema: ConfigSchema) => void;
  onRunningChanged: (isRunning: boolean) => void;
}
```

Эти callback'и — мост между императивным миром Engine и реактивным миром React. Они вызывают `setState` хука.

### 6.2. `useAutomatonEngine`

**Роль**: React-хук, управляющий полным жизненным циклом автомата. Загружает код, компилирует, создаёт Engine, предоставляет реактивный стейт и методы управления.

**Двухфазная инициализация**:

```
useEffect #1 (зависимость: automatonId)
  Загружает код с сервера → компилирует → setProgram(program)
  Триггерит ререндер → canvas появляется в DOM

useEffect #2 (зависимость: program)
  canvas уже в DOM → new AutomatonEngine(program, canvas, callbacks)
  engine.start()
```

**Возвращает**:

```ts
{
  // Рефы
  canvasRef: RefObject<HTMLCanvasElement>;

  // Реактивный стейт
  schema: ConfigSchema | null;
  params: Record<string, unknown>;
  iteration: number;
  isRunning: boolean;
  loading: boolean;
  error: string | null;
  eventBus: EventBus | null;

  // Методы управления (стабильные ссылки через useCallback)
  start: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setParam: (key: string, value: unknown) => void;
  runAction: (actionId: string) => void;
  setSpeed: (speed: number) => void;
  setRenderEveryN: (n: number) => void;
}
```

---

## 7. GUI-компоненты

### 7.1. `AutomatonView`

**Роль**: Готовая композиция всех GUI-компонентов. Единственный компонент, который нужно использовать на странице.

**Использование**:

```tsx
<AutomatonView automatonId="game_of_life" />
```

**Внутренняя структура**:

```
AutomatonView
  ├─ useAutomatonEngine(automatonId)
  ├─ AutomatonHeader (schema.name, schema.description)
  ├─ <canvas ref={canvasRef} />
  ├─ ControlPanel (play/pause/step/reset/speed/renderEveryN)
  ├─ ConfigPanel (автогенерация из schema.params + schema.actions)
  └─ EventLogPanel (подписан на eventBus "automaton:event")
```

### 7.2. `AutomatonHeader`

Отображает имя автомата и бейдж с версией API.

### 7.3. `ControlPanel`

Кнопки управления симуляцией и слайдеры runtime-параметров (скорость, renderEveryN). Хранит локальный стейт для отображения текущих значений слайдеров.

### 7.4. `ConfigPanel`

Автоматически генерирует UI-виджеты из `ConfigSchema`:

| `ui` в ParamDef | React-компонент |
|-----------------|----------------|
| `"scroller"` | `ParamSlider` (shadcn `Slider`) |
| `"combobox"` | `ParamSelect` (shadcn `Select`) |
| `"checkbox"` | `ParamCheckbox` (shadcn `Checkbox`) |
| `"input"` | `ParamInput` (shadcn `Input`) |
| `"radio"` | `ParamSelect` (пока через Select) |

Кнопки действий (`schema.actions`) отображаются как `ActionButton` (shadcn `Button`).

### 7.5. `EventLogPanel`

Подписывается на `EventBus` канал `"automaton:event"`. Отображает последние N событий с цветными бейджами по типу.

---

## 8. Написание автомата

### 8.1. Минимальный автомат

```ts
export default class MinimalAutomaton {
  grid = new Uint8Array(0);
  width = 0;
  height = 0;

  getApiVersion() { return "0.2"; }

  getConfigSchema() {
    return {
      name: "Минимальный автомат",
      description: "Ничего не делает",
      apiVersion: "0.2",
      params: {},
      actions: {},
    };
  }

  getConfig() { return {}; }
  setConfig(_params) { return null; }

  init(ctx) {
    this.width = ctx.gridWidth;
    this.height = ctx.gridHeight;
    this.grid = new Uint8Array(this.width * this.height);
  }

  iterate(_ctx) {}

  render() {
    return {
      type: "grid",
      width: this.width,
      height: this.height,
      cells: this.grid,
    };
  }

  runAction(_actionId) {}
  destroy() { this.grid = new Uint8Array(0); }
}
```

### 8.2. Контрольный список для автора автомата

- [ ] Класс экспортируется как `export default class MyAutomaton`
- [ ] Реализованы все 9 методов `IAutomaton`
- [ ] `getApiVersion()` возвращает `"0.2"`
- [ ] `getConfigSchema()` возвращает валидную `ConfigSchema`
- [ ] `init(ctx)` сохраняет `ctx.runtime` и создаёт массивы
- [ ] `iterate()` не рисует — только обновляет состояние
- [ ] `render()` возвращает `RenderData` (не `null`, если есть что показать)
- [ ] `setConfig()` возвращает `ConfigSchema | null`
- [ ] `destroy()` освобождает все тяжёлые ресурсы
- [ ] Нет `import` из внешних модулей (код выполняется в изоляции)
- [ ] Нет обращений к DOM, `window`, `document`, `canvas`

---

## 9. Жизненный цикл системы

### 9.1. Полный поток от URL до пикселей

```
1. Пользователь открывает /apis/api_v0.2/automaton/maze_generator
   │
2. React Router рендерит AutomatonView({ automatonId: "maze_generator" })
   │
3. useAutomatonEngine("maze_generator")
   │
4. useEffect #1: загрузка
   │  APIMethodGetAutomataByID.execute("maze_generator")
   │  → GET /api/automata/maze_generator
   │  → { source_code: "export default class MazeGenerator { ... }" }
   │
5. loadProgram(source, "typescript")
   │  → compileTypeScript(source) → JavaScript
   │  → new Blob([js]) → URL.createObjectURL
   │  → import(url) → module.default (класс)
   │  → new Program() → инстанс IAutomaton
   │  → validateProgram() → проверка всех 9 методов
   │
6. setProgram(program), setSchema(...), setParams(...)
   │  → React ререндер → canvas появляется в DOM
   │
7. useEffect #2: инициализация
   │  new AutomatonEngine(program, canvas, callbacks)
   │    │
   │    ├─ new EventBus()
   │    ├─ new CanvasGridRenderer(canvas).attach(eventBus)
   │    └─ new RuntimeV02(program, eventBus)
   │         ├─ new RuntimeParams()
   │         ├─ runtimeCallback = { emitEvent, requestStop, ... }
   │         └─ new LoopController(params, onTick, onRender)
   │
8. engine.start()
   │  → runtime.start()
   │    → automaton.init({ gridWidth, gridHeight, runtime: callback })
   │    → loop.start()
   │      → requestAnimationFrame(loop)
   │
9. Каждый кадр (~16мс):
   │  loop():
   │    ├─ accumulator += dt * speed
   │    ├─ while (accumulator >= stepDuration):
   │    │    automaton.iterate({ step, time, deltaTime })
   │    │
   │    └─ if (stepsSinceRender >= renderEveryN):
   │         automaton.render() → RenderData
   │         eventBus.emit("render:data", data)
   │         CanvasGridRenderer.draw(data) → пиксели на canvas
   │
10. Пользователь двигает слайдер "Плотность":
    │  ConfigPanel → onParamChange("density", 0.7)
    │  → engine.setParam("density", 0.7)
    │    → runtime.setParam("density", 0.7)
    │      → automaton.setConfig({ density: 0.7 })
    │        → return null (схема не изменилась)
    │      → eventBus.emit("config:changed", ...)
    │        → callback → setParams({...}) → React ререндер
    │
11. Пользователь нажимает "🔄 Новый лабиринт":
    │  ConfigPanel → onAction("generate")
    │  → engine.runAction("generate")
    │    → runtime.runAction("generate")
    │      → automaton.runAction("generate")
    │        → this.startGeneration()
    │        → this.runtime.emitEvent({ type: "info", message: "..." })
    │          → eventBus.emit("automaton:event", event)
    │            → EventLogPanel показывает уведомление
    │
12. Пользователь уходит со страницы:
    │  useEffect cleanup:
    │  → engine.destroy()
    │    → runtime.destroy()
    │      → loop.stop() → cancelAnimationFrame
    │      → automaton.destroy() → освобождение массивов
    │    → renderer.destroy() → отписка от EventBus
    │    → eventBus.clear() → удаление всех подписок
```

---

### 9.2. Диаграмма состояний `LoopController`

```
          start()          pause()
[STOPPED] ──────► [RUNNING] ──────► [PAUSED]
    ▲                │                 │
    │   stop()       │   stop()        │  resume()
    ├────────────────┘                 │
    ├──────────────────────────────────┘
    │                                  │
    │             resume()             │
    └──────────────── [PAUSED] ◄───────┘

  stepOnce() — работает из любого состояния, не меняет состояние.
  resetStepCount() — работает из любого состояния, сбрасывает счётчик.
```

---

### 9.3. Файловая структура (финальная)

```
client_apis/v0.2/
├── index.ts                        # Публичный API
│
├── contract/                       # 🟦 Контракт автомата
│   ├── index.ts
│   ├── IAutomaton.ts               #   9 методов
│   ├── IRuntimeCallback.ts         #   5 методов обратной связи
│   └── types/
│       ├── config.ts               #   ConfigSchema, ParamDef, ActionDef
│       ├── context.ts              #   AutomatonContext, IterationContext
│       ├── render.ts               #   RenderData, GridRenderData, RawBytesRenderData
│       └── events.ts               #   AutomatonEvent
│
├── runtime/                        # 🟨 Система исполнения
│   ├── index.ts
│   ├── EventBus.ts                 #   Шина событий
│   ├── RuntimeParams.ts            #   Параметры среды
│   ├── LoopController.ts           #   Цикл requestAnimationFrame
│   ├── BaseRuntimeProgram.ts       #   Абстрактный базовый класс
│   └── RuntimeV02.ts               #   Реализация для v0.2
│
├── renderers/                      # 🟩 Визуализация
│   ├── index.ts
│   ├── IRenderer.ts                #   Интерфейс рендерера
│   └── CanvasGridRenderer.ts       #   Canvas 2D реализация
│
├── engine/                         # 🟪 Оркестрация
│   ├── index.ts
│   ├── AutomatonEngine.ts          #   Связывает runtime + renderer + eventbus
│   └── useAutomatonEngine.ts       #   React hook (двухфазная инициализация)
│
├── gui/                            # 🟧 React-компоненты
│   ├── index.ts
│   ├── AutomatonView.tsx           #   Готовая композиция всего UI
│   ├── AutomatonHeader.tsx         #   Название + описание + бейдж
│   ├── ControlPanel.tsx            #   Play/Pause/Step/Reset + слайдеры
│   ├── ConfigPanel.tsx             #   Автогенерация UI из ConfigSchema
│   ├── EventLogPanel.tsx           #   Лог событий от автомата
│   └── widgets/                    #   Обёртки над shadcn
│       ├── ParamSlider.tsx
│       ├── ParamSelect.tsx
│       ├── ParamCheckbox.tsx
│       ├── ParamInput.tsx
│       └── ActionButton.tsx
│
└── example/                        # 🟫 Примеры автоматов
    ├── GameOfLife.ts
    └── MazeGenerator.ts
```