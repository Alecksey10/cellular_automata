# Контекст проекта: API v0.2 «Клеточные автоматы»

> Версия документа: 2026-10-05\
> Назначение: долговременный контекст для ChatGPT, другого языкового
> агента или разработчика, который продолжает работу над проектом.

------------------------------------------------------------------------

## 0. Зачем существует этот документ

Этот документ является рабочим контекстом проекта. Его цель --- дать
следующему агенту достаточно информации, чтобы продолжать разработку без
повторного изучения всей архитектуры и без нарушения существующих
контрактов.

Документ фиксирует:

1.  текущую пользовательскую задачу;
2.  архитектуру API v0.2;
3.  сущности и отношения между классами;
4.  публичные интерфейсы без лишней реализации;
5.  жизненный цикл автомата в браузере;
6.  модульные границы;
7.  правила взаимодействия GUI / Engine / Runtime / Automaton;
8.  текущую работу над декларативным GUI;
9.  текущий тестовый автомат «Критический лес»;
10. известные несовершенства и места, которые нужно проверить перед
    следующими изменениями;
11. правила для будущих доработок.

------------------------------------------------------------------------

# 1. Текущий пользовательский запрос

## 1.1. Исходная задача

Пользователь разрабатывает API для запуска клеточных автоматов в
браузере.

В процессе работы потребовалось расширить декларативную конфигурацию
GUI.

Требуемые возможности:

-   настоящий radio-button widget;
-   секции конфигурации;
-   визуальное разделение тематических групп;
-   рекурсивные секции;
-   секция может содержать параметры, actions и другие секции;
-   существующие простые автоматы не должны ломаться;
-   GUI должен оставаться декларативным;
-   изменения должны затрагивать минимум несвязанных классов.

## 1.2. Текущая задача, которую необходимо помнить

Пользователь попросил создать тестовый клеточный автомат для проверки
новой конфигурационной системы.

Автомат:

**«Критический лес»**

Предметная модель:

-   распространение лесного пожара;
-   накопление топлива;
-   восстановление леса;
-   случайные возгорания;
-   молнии;
-   дождь;
-   влажность;
-   сухость;
-   ветер;
-   сезонность;
-   крупные лавинообразные пожары.

Автомат должен демонстрировать:

1.  изменение размера мира;
2.  тематические секции GUI;
3.  вложенные секции;
4.  radio buttons;
5.  переключение между простым и расширенным GUI;
6.  кнопки управления событиями;
7.  изменение цветовой палитры;
8.  качественно отличающуюся динамику по сравнению с простыми
    демонстрационными автоматами.

## 1.3. Текущая модель GUI

Предполагаемое дерево:

``` text
Configuration
├── Interface
│   └── uiMode
│
├── World
│   ├── width
│   └── height
│
├── Forest
│   ├── forestDensity
│   ├── maxTreeAge
│   ├── Regrowth
│   │   └── regrowthRate
│   └── Moisture and Fuel
│       ├── soilMoisture
│       └── fuelDryness
│
├── Fire
│   ├── lightningChance
│   ├── spreadProbability
│   ├── windInfluence
│   ├── burnDuration
│   └── ignitionThreshold
│
├── Environment
│   ├── Wind
│   ├── Weather
│   └── Seasons
│
├── Appearance
│   └── palette
│
└── Events
    ├── Fire Events
    ├── Forest Events
    └── Weather Events
```

Это дерево является проектным расширением GUI, а не частью
первоначального плоского `ConfigSchema`.

------------------------------------------------------------------------

# 2. Источник архитектуры

Основной источник архитектурного контекста --- документация:

**«Документация API v0.2 --- Клеточные автоматы»**

Она описывает архитектуру из трёх основных слоёв:

``` text
GUI Layer
    ↓
Runtime / Engine Layer
    ↓
Automaton Layer
```

Главный принцип:

``` text
GUI → Engine → Runtime → Automaton
```

Обратная связь:

``` text
Automaton → IRuntimeCallback → Runtime/EventBus → GUI
```

Автомат не должен зависеть от React, DOM, Canvas или компонентов GUI.

------------------------------------------------------------------------

# 3. Главные архитектурные принципы

## 3.1. Изоляция автомата

Пользовательский автомат:

-   не знает о React;
-   не знает о DOM;
-   не знает о `<canvas>`;
-   не импортирует GUI-компоненты;
-   не импортирует runtime;
-   не импортирует EventBus;
-   не рисует самостоятельно.

Он работает только с:

-   собственным состоянием;
-   контекстами API;
-   конфигурацией;
-   RenderData;
-   IRuntimeCallback.

## 3.2. Однонаправленные зависимости

Правильное направление:

``` text
GUI
 ↓
Engine
 ↓
Runtime
 ↓
IAutomaton
```

Неправильно:

``` text
Automaton → React
Automaton → Canvas
Automaton → EventBus
Automaton → DOM
Automaton → Engine
```

## 3.3. Декларативный GUI

Автомат описывает:

``` text
что настраивать
```

но не описывает:

``` text
как React должен это нарисовать
```

Например:

``` text
parameter:
    type = number
    ui = scroller
    min = 0
    max = 1
```

Runtime/GUI превращает это в конкретный React-компонент.

## 3.4. Версионность

API является версионным.

Для v0.2 должны существовать собственные:

-   contract;
-   runtime;
-   GUI;
-   renderers;
-   engine.

Будущая v0.3 не должна незаметно ломать v0.2.

------------------------------------------------------------------------

# 4. Архитектура каталогов

Ожидаемая структура:

``` text
client_apis/v0.2/
│
├── index.ts
│
├── contract/
│   ├── index.ts
│   ├── IAutomaton.ts
│   ├── IRuntimeCallback.ts
│   │
│   └── types/
│       ├── config.ts
│       ├── context.ts
│       ├── render.ts
│       └── events.ts
│
├── runtime/
│   ├── index.ts
│   ├── EventBus.ts
│   ├── RuntimeParams.ts
│   ├── LoopController.ts
│   ├── BaseRuntimeProgram.ts
│   └── RuntimeV02.ts
│
├── renderers/
│   ├── index.ts
│   ├── IRenderer.ts
│   └── CanvasGridRenderer.ts
│
├── engine/
│   ├── index.ts
│   ├── AutomatonEngine.ts
│   └── useAutomatonEngine.ts
│
├── gui/
│   ├── index.ts
│   ├── AutomatonView.tsx
│   ├── AutomatonHeader.tsx
│   ├── ControlPanel.tsx
│   ├── ConfigPanel.tsx
│   ├── EventLogPanel.tsx
│   │
│   └── widgets/
│       ├── ParamSlider.tsx
│       ├── ParamSelect.tsx
│       ├── ParamCheckbox.tsx
│       ├── ParamInput.tsx
│       ├── ActionButton.tsx
│       ├── ParamRadio.tsx       # новое
│       └── ConfigSection.tsx     # новое
│
└── example/
    ├── GameOfLife.ts
    ├── MazeGenerator.ts
    └── CriticalForest.ts        # текущий тестовый автомат
```

------------------------------------------------------------------------

# 5. Контракт автомата

## 5.1. IAutomaton

Главный контракт:

``` ts
interface IAutomaton {
  getApiVersion(): string;

  getConfigSchema(): ConfigSchema;

  getConfig(): Record<string, unknown>;

  setConfig(
    params: Record<string, unknown>
  ): ConfigSchema | null;

  init(
    context: AutomatonContext
  ): void;

  iterate(
    ctx: IterationContext
  ): void;

  render(): RenderData | null;

  runAction(
    actionId: string,
    payload?: unknown
  ): void;

  destroy(): void;
}
```

Всего 9 методов.

------------------------------------------------------------------------

# 6. Семантика IAutomaton

  Метод                 Назначение
  --------------------- ----------------------------------
  `getApiVersion()`     сообщает версию API
  `getConfigSchema()`   описывает GUI и параметры
  `getConfig()`         возвращает текущую конфигурацию
  `setConfig()`         принимает изменения конфигурации
  `init()`              создаёт состояние автомата
  `iterate()`           выполняет один логический шаг
  `render()`            отдаёт данные для визуализации
  `runAction()`         выполняет именованное действие
  `destroy()`           освобождает ресурсы

## Важный принцип

`iterate()` не должен рисовать.

`render()` не должен менять модель.

Идеальная логика:

``` text
iterate()
    ↓
state changes

render()
    ↓
state → RenderData
```

------------------------------------------------------------------------

# 7. AutomatonContext

``` ts
interface AutomatonContext {
  gridWidth: number;
  gridHeight: number;
  runtime: IRuntimeCallback;
}
```

Передаётся при `init()`.

Автомат должен:

-   сохранить `runtime`, если ему нужны события;
-   использовать размеры для первоначальной инициализации;
-   не воспринимать `runtime` как объект Engine.

------------------------------------------------------------------------

# 8. IterationContext

``` ts
interface IterationContext {
  step: number;
  time: number;
  deltaTime: number;
}
```

Передаётся в каждый `iterate()`.

Смысл:

``` text
step       номер итерации
time       текущее время
deltaTime  время логического шага
```

------------------------------------------------------------------------

# 9. IRuntimeCallback

``` ts
interface IRuntimeCallback {
  emitEvent(event: AutomatonEvent): void;

  requestStop(): void;

  requestPause(): void;

  requestSpeedChange(factor: number): void;

  requestRenderIntervalChange(n: number): void;
}
```

Это единственный официальный канал влияния автомата на среду исполнения.

------------------------------------------------------------------------

# 10. AutomatonEvent

``` ts
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

Семантика:

``` text
info
    обычная информация

warning
    предупреждение

error
    ошибка; runtime может поставить симуляцию на паузу

request
    зарезервированный тип для будущих механизмов
```

Автомат не должен напрямую обращаться к `EventLogPanel`.

------------------------------------------------------------------------

# 11. Конфигурация: текущее состояние

## 11.1. Исходный ConfigSchema

Текущий пользовательский `config.ts` содержит:

``` ts
interface ConfigSchema {
  name: string;
  description: string;
  apiVersion: string;

  params: Record<string, ParamDef>;

  actions: Record<string, ActionDef>;
}
```

Это плоская схема.

## 11.2. ParamDef

``` ts
interface ParamDef {
  type:
    | "number"
    | "string"
    | "boolean";

  default:
    | number
    | string
    | boolean;

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
```

## 11.3. ActionDef

``` ts
interface ActionDef {
  label: string;
  description?: string;
}
```

------------------------------------------------------------------------

# 12. Важное расхождение: sections

В исходной документации `ConfigSchema` был плоским.

В текущей работе была поставлена новая задача:

> сделать GUI рекурсивным.

Поэтому следующий архитектурный шаг должен расширить контракт.

Рекомендуемая модель:

``` ts
interface ConfigSection {
  id: string;

  label: string;

  description?: string;

  params?: string[];

  actions?: string[];

  sections?: ConfigSection[];
}
```

А `ConfigSchema`:

``` ts
interface ConfigSchema {
  name: string;
  description: string;
  apiVersion: string;

  params: Record<string, ParamDef>;

  actions: Record<string, ActionDef>;

  sections?: ConfigSection[];
}
```

### Почему параметры остаются в `params`

Не следует делать:

``` ts
sections: [
  {
    param: ParamDef
  }
]
```

или смешивать описание значения и описание расположения.

Правильное разделение:

``` text
params
    = что представляет собой параметр

sections
    = где параметр показывается
```

Это позволяет одному описанию параметра оставаться частью модели
конфигурации, а секциям быть только представлением.

------------------------------------------------------------------------

# 13. Рекурсивная структура GUI

Целевая модель:

``` text
ConfigSchema
│
├── params
│
├── actions
│
└── sections
    │
    ├── section
    │   ├── params
    │   ├── actions
    │   └── sections
    │       └── ...
    │
    └── ...
```

Это означает:

``` text
Section
 ├─ Parameter
 ├─ Parameter
 ├─ Action
 └─ Section
     ├─ Parameter
     └─ Section
```

Глубина вложенности не должна быть искусственно ограничена GUI.

------------------------------------------------------------------------

# 14. Правило размещения параметров

Параметр идентифицируется ключом:

``` ts
params["forestDensity"]
```

Секция содержит только ссылку:

``` ts
params: ["forestDensity"]
```

GUI находит определение:

``` text
section
  ↓
"forestDensity"
  ↓
schema.params["forestDensity"]
  ↓
ParamDef
  ↓
ParamSlider
```

------------------------------------------------------------------------

# 15. Новый ParamRadio

Сейчас старый `ConfigPanel` делает:

``` text
ui === "radio"
    ↓
ParamSelect
```

Это НЕ настоящий radio.

Цель:

``` text
ui === "radio"
    ↓
ParamRadio
    ↓
несколько RadioGroupItem
```

Сущность:

``` ts
interface ParamRadioProps {
  label: string;
  description?: string;

  value: string;

  options: string[];

  disabled?: boolean;

  onChange(value: string): void;
}
```

Он должен быть визуально отличен от dropdown.

------------------------------------------------------------------------

# 16. Новый ConfigSection

Рекомендуемая ответственность:

``` ts
interface ConfigSectionProps {
  id: string;

  label: string;

  description?: string;

  children: React.ReactNode;
}
```

`ConfigSection` отвечает только за визуальную группировку:

-   заголовок;
-   описание;
-   рамку/card;
-   отступы;
-   вложенный контент.

Он не должен знать, что такое `ParamDef`.

------------------------------------------------------------------------

# 17. ConfigPanel

Текущий `ConfigPanel` должен стать рекурсивным renderer'ом.

Концептуально:

``` text
ConfigPanel
    │
    └── renderSection(section)
            │
            ├── render params
            ├── render actions
            └── renderSection(child)
```

То есть:

``` ts
function renderSection(section: ConfigSection) {
  return (
    <ConfigSection>
      {section.params?.map(renderParam)}
      {section.actions?.map(renderAction)}
      {section.sections?.map(renderSection)}
    </ConfigSection>
  );
}
```

------------------------------------------------------------------------

# 18. Совместимость со старым GUI

Это важный принцип.

Старый автомат:

``` ts
{
  params: {
    density: ...
  },

  actions: {
    reset: ...
  }
}
```

не должен перестать работать только потому, что появилась `sections`.

Рекомендуемое поведение:

``` text
если sections есть
    → использовать дерево sections

иначе
    → использовать старый плоский renderer
```

Таким образом:

``` text
v0.2 старые автоматы
        ↓
работают

новые автоматы
        ↓
могут использовать sections
```

------------------------------------------------------------------------

# 19. Визуализация

## 19.1. RenderData

``` ts
type RenderData =
  | GridRenderData
  | RawBytesRenderData;
```

## 19.2. GridRenderData

``` ts
interface GridRenderData {
  type: "grid";

  width: number;
  height: number;

  cells:
    | Uint8Array
    | Uint32Array;

  palette?: string[];
}
```

Для `Uint8Array`:

``` text
cells[index] = state ID
palette[state ID] = CSS color
```

Для `Uint32Array` значения могут интерпретироваться как ARGB.

## 19.3. RawBytesRenderData

``` ts
interface RawBytesRenderData {
  type: "raw";

  width: number;
  height: number;

  data: Uint8ClampedArray;
}
```

`data`:

``` text
RGBA
width × height × 4
```

------------------------------------------------------------------------

# 20. CanvasGridRenderer

Ответственность:

``` text
RenderData → Canvas 2D
```

Он:

-   получает `<canvas>`;
-   подписывается на EventBus;
-   получает `render:data`;
-   рисует;
-   умеет resize;
-   освобождает подписки.

Он не должен знать:

-   конфигурацию автомата;
-   React;
-   `IAutomaton`;
-   `RuntimeV02`.

------------------------------------------------------------------------

# 21. IRenderer

``` ts
interface IRenderer {
  attach(eventBus: EventBus): void;

  detach(): void;

  draw(data: RenderData): void;

  resize(
    width: number,
    height: number
  ): void;

  destroy(): void;
}
```

Renderer --- заменяемая часть.

Теоретически можно иметь:

``` text
CanvasGridRenderer
SVGRenderer
WebGLRenderer
OffscreenCanvasRenderer
```

без изменения автомата.

------------------------------------------------------------------------

# 22. EventBus

``` ts
class EventBus {
  on<T>(
    event: string,
    handler: (data: T) => void
  ): void;

  off<T>(
    event: string,
    handler: (data: T) => void
  ): void;

  emit<T>(
    event: string,
    data?: T
  ): void;

  clear(): void;
}
```

EventBus не должен содержать бизнес-логику.

Это контейнер подписок.

------------------------------------------------------------------------

# 23. Каналы EventBus

Основные каналы:

``` text
render:data
    Runtime → Renderer

automaton:event
    Runtime → GUI

config:changed
    Runtime → GUI

schema:changed
    Runtime → GUI

runtime:state
    Runtime → GUI

iteration:tick
    Runtime → GUI
```

## `render:data`

``` text
RenderData
```

## `automaton:event`

``` text
AutomatonEvent
```

## `config:changed`

Концептуально:

``` ts
{
  key,
  value,
  newSchema
}
```

## `schema:changed`

``` text
ConfigSchema
```

## `runtime:state`

``` text
"started" | "paused" | "stopped"
```

## `iteration:tick`

``` text
number
```

------------------------------------------------------------------------

# 24. RuntimeParams

Runtime parameters относятся к среде исполнения, а не к физике автомата.

``` ts
class RuntimeParams {
  speed: number;

  targetFps: number;

  renderEveryN: number;

  paused: boolean;

  maxIterationsPerFrame: number;

  defaultGridWidth: number;

  defaultGridHeight: number;
}
```

Не следует помещать туда:

``` text
forestDensity
gravity
temperature
birthProbability
palette
```

Это параметры конкретного автомата.

------------------------------------------------------------------------

# 25. LoopController

Ответственность:

``` text
requestAnimationFrame
        ↓
накопление времени
        ↓
итерации
        ↓
рендер
```

Состояния:

``` text
STOPPED
RUNNING
PAUSED
```

Переходы:

``` text
STOPPED
   │
   │ start()
   ▼
RUNNING
   │
   ├── pause() ──→ PAUSED
   │                 │
   │                 └── resume() ──→ RUNNING
   │
   └── stop() ──→ STOPPED
```

`stepOnce()`:

-   выполняет один логический шаг;
-   не должен самовольно менять состояние цикла.

------------------------------------------------------------------------

# 26. BaseRuntimeProgram

Это адаптер между runtime и `IAutomaton`.

Концептуально:

``` text
BaseRuntimeProgram
│
├── automaton
├── eventBus
├── params
├── loop
├── runtimeCallback
└── initialized
```

Основная роль:

``` text
Runtime API
    ↕
IAutomaton
```

Он вызывает:

``` text
automaton.init()
automaton.iterate()
automaton.render()
automaton.setConfig()
automaton.runAction()
automaton.destroy()
```

------------------------------------------------------------------------

# 27. RuntimeV02

``` ts
class RuntimeV02 extends BaseRuntimeProgram {
  getApiVersion(): string;
}
```

Для v0.2:

``` text
"0.2"
```

В будущем именно здесь допустимы v0.2-специфические runtime-правила.

------------------------------------------------------------------------

# 28. AutomatonEngine

Engine --- оркестратор.

Он связывает:

``` text
Runtime
Renderer
EventBus
GUI callbacks
```

Концептуально:

``` text
AutomatonEngine
│
├── EventBus
├── RuntimeV02
└── CanvasGridRenderer
```

Engine не должен содержать физику конкретного автомата.

------------------------------------------------------------------------

# 29. useAutomatonEngine

React hook отвечает за связывание React UI с Engine.

Ключевая идея:

``` text
React lifecycle
      ↓
Engine lifecycle
```

Он обеспечивает:

-   загрузку автомата;
-   создание engine;
-   передачу callbacks;
-   синхронизацию React state;
-   cleanup.

------------------------------------------------------------------------

# 30. AutomatonView

Высокоуровневая композиция страницы.

Концептуально:

``` text
AutomatonView
│
├── AutomatonHeader
├── ControlPanel
├── ConfigPanel
├── Canvas
└── EventLogPanel
```

------------------------------------------------------------------------

# 31. GUI-компоненты

## AutomatonHeader

Показывает:

-   имя;
-   описание;
-   API version/status.

## ControlPanel

Управляет runtime:

-   start;
-   pause;
-   step;
-   reset;
-   speed;
-   render interval.

Важно:

**ControlPanel не должен смешиваться с параметрами конкретного
автомата.**

Например:

``` text
скорость симуляции
```

--- runtime.

``` text
плотность леса
```

--- automaton config.

## ConfigPanel

Отображает `ConfigSchema`.

## EventLogPanel

Подписывается на:

``` text
automaton:event
```

и показывает события.

------------------------------------------------------------------------

# 32. Widget mapping

Текущий mapping:

``` text
scroller
    → ParamSlider

input
    → ParamInput

combobox
    → ParamSelect

checkbox
    → ParamCheckbox

radio
    → ParamRadio   ← целевое состояние

action
    → ActionButton
```

------------------------------------------------------------------------

# 33. Browser execution model

Это принципиально важно для будущих агентов.

Автомат приходит с сервера как строка исходного кода.

Концептуальный pipeline:

``` text
HTTP/API
   ↓
source_code
   ↓
TypeScript compiler
   ↓
JavaScript
   ↓
Blob
   ↓
Object URL
   ↓
dynamic import()
   ↓
module.default
   ↓
new Program()
   ↓
IAutomaton
```

То есть пользовательский код реально исполняется внутри браузера.

------------------------------------------------------------------------

# 34. Что это означает для модульности

Автомат является модулем приложения, но не обычным внутренним
React-модулем.

Он динамически загружается.

Поэтому автомат должен быть максимально самодостаточным.

Нормально:

``` ts
export default class MyAutomaton {
  ...
}
```

Ненормально:

``` ts
import React from "react";
import { Button } from "...";
```

Также нельзя полагаться на:

``` ts
window
document
canvas
localStorage
DOM
React state
```

если это не предусмотрено отдельным API.

------------------------------------------------------------------------

# 35. Почему автомат не должен импортировать EventBus

Плохой вариант:

``` text
Automaton
   ↓
EventBus
```

Хороший:

``` text
Automaton
   ↓
runtime.emitEvent()
   ↓
Runtime
   ↓
EventBus
```

Это сохраняет заменяемость runtime и делает автомат переносимым.

------------------------------------------------------------------------

# 36. Жизненный цикл в браузере

Полный поток:

``` text
URL
 ↓
AutomatonView
 ↓
useAutomatonEngine
 ↓
получение source_code
 ↓
compileTypeScript
 ↓
dynamic import
 ↓
new Automaton()
 ↓
validateProgram
 ↓
React state: schema/params
 ↓
создание Canvas
 ↓
AutomatonEngine
 ├── EventBus
 ├── RuntimeV02
 └── CanvasGridRenderer
 ↓
engine.start()
 ↓
runtime.start()
 ↓
automaton.init()
 ↓
requestAnimationFrame loop
```

Далее:

``` text
frame
 ↓
LoopController
 ↓
0..N × automaton.iterate()
 ↓
automaton.render()
 ↓
EventBus.emit("render:data")
 ↓
CanvasGridRenderer.draw()
```

------------------------------------------------------------------------

# 37. Изменение параметра

Например:

``` text
density = 0.7
```

Поток:

``` text
Slider
 ↓
ConfigPanel
 ↓
onParamChange("density", 0.7)
 ↓
Engine
 ↓
Runtime
 ↓
automaton.setConfig({
  density: 0.7
})
 ↓
ConfigSchema | null
```

Если `null`:

``` text
структура GUI не изменилась
```

Если новый `ConfigSchema`:

``` text
GUI должен перестроиться
```

------------------------------------------------------------------------

# 38. Динамическая схема GUI

Это особенно важно для текущей задачи.

Автомат может иметь:

``` ts
setConfig(...)
```

который возвращает:

``` ts
newSchema
```

Например:

``` text
uiMode = simple
```

→ схема содержит мало секций.

Пользователь выбирает:

``` text
uiMode = advanced
```

→ `setConfig()` возвращает другую схему.

→ runtime публикует `schema:changed`.

→ React обновляет schema.

→ ConfigPanel рендерит новое дерево.

Это позволяет GUI быть динамическим.

------------------------------------------------------------------------

# 39. Тестовый автомат «Критический лес»

Создан концептуальный тестовый автомат:

``` text
CriticalForestAutomaton
```

Состояния:

``` text
0 = EMPTY
1 = TREE
2 = BURNING
3 = ASH
```

Состояние леса хранится в:

``` text
Uint8Array state
Uint8Array nextState
Uint8Array fuel
Uint8Array nextFuel
```

Это хороший пример для API, потому что он проверяет:

-   grid;
-   palette;
-   actions;
-   events;
-   config;
-   nested sections;
-   radio;
-   dynamic schema;
-   resizing;
-   несколько параметров разных типов.

------------------------------------------------------------------------

# 40. Конфигурация Critical Forest

Основные группы:

``` text
Interface
World
Forest
Fire
Environment
Appearance
Events
```

Внутри:

``` text
Forest
 ├── forestDensity
 ├── maxTreeAge
 ├── Regrowth
 │    └── regrowthRate
 └── Moisture and Fuel
      ├── soilMoisture
      └── fuelDryness
```

``` text
Environment
 ├── Wind
 │    ├── windDirection
 │    └── windStrength
 │
 ├── Weather
 │    ├── rainChance
 │    └── rainStrength
 │
 └── Seasons
      ├── seasonalCycle
      └── seasonLength
```

------------------------------------------------------------------------

# 41. Режимы GUI Critical Forest

## Simple

Показывает основные параметры:

``` text
Interface
World
Forest
Fire
Events
```

## Advanced

Показывает:

``` text
Interface
World
Forest
  ├── Regrowth
  └── Moisture and Fuel
Fire
Environment
  ├── Wind
  ├── Weather
  └── Seasons
Appearance
Events
  ├── Fire
  ├── Forest
  └── Weather
```

------------------------------------------------------------------------

# 42. Actions Critical Forest

``` text
newForest
igniteCenter
lightning
rain
extinguish
regrow
drySeason
wetSeason
```

Их смысл:

``` text
newForest
    пересоздаёт лес

igniteCenter
    создаёт центральный очаг

lightning
    вызывает случайное возгорание

rain
    воздействует на влагу и огонь

extinguish
    тушит активные очаги

regrow
    восстанавливает растительность

drySeason
    увеличивает сухость

wetSeason
    увеличивает влажность
```

------------------------------------------------------------------------

# 43. Палитры Critical Forest

Предусмотрены:

``` text
natural
contrast
mono
```

Состояния индексируются через:

``` text
palette[state]
```

Например:

``` text
EMPTY
TREE
BURNING
ASH
```

------------------------------------------------------------------------

# 44. Что именно делает модель Critical Forest критической

Модель не является строгой физической моделью реального леса.

Она предназначена как клеточный автомат, демонстрирующий:

``` text
медленное накопление топлива
        +
редкие внешние возгорания
        +
локальное распространение
        +
пространственная неоднородность
        +
влажность/сухость
        +
ветер
```

Это может приводить к:

``` text
много маленьких очагов
+
редкие крупные пожары
```

То есть автомат подходит как демонстрация самоорганизующейся
критичности.

------------------------------------------------------------------------

# 45. Изменение размера мира

В текущем тестовом автомате:

``` text
width
height
```

являются параметрами автомата.

При изменении размера:

1.  сохраняется доступная часть старого мира;
2.  создаются новые массивы;
3.  новые области заселяются;
4.  renderer получает новый `width/height` из `render()`.

Но это место требует проверки реальной реализации `CanvasGridRenderer`.

------------------------------------------------------------------------

# 46. Важный технический риск: resize

Нужно отдельно проверить:

``` text
ConfigPanel
 ↓
setParam(width)
 ↓
automaton.setConfig()
 ↓
automaton changes internal arrays
 ↓
render()
 ↓
RenderData(width, height)
 ↓
CanvasGridRenderer.resize()
```

Если renderer не реагирует на изменение размеров RenderData
автоматически, необходимо исправить renderer/engine.

Нельзя решать это обращением автомата к Canvas.

Правильное решение:

``` text
Automaton → RenderData
Renderer → адаптация Canvas
```

------------------------------------------------------------------------

# 47. Текущая точка интеграции

На момент создания этого документа пользователь предоставил реальный
код:

-   `contract/types/config.ts`;
-   `gui/ConfigPanel.tsx`;
-   `gui/widgets/ParamSelect.tsx`;
-   `gui/widgets/ParamCheckbox.tsx`;
-   `gui/widgets/ParamInput.tsx`;
-   `gui/widgets/ActionButton.tsx`;
-   `gui/index.ts`.

`ConfigPanel` сейчас:

-   читает `schema.params`;
-   создаёт виджеты;
-   читает `schema.actions`;
-   создаёт `ActionButton`;
-   для `radio` пока использует `ParamSelect`.

Следовательно, ближайшая архитектурная работа должна учитывать именно
эти реальные компоненты.

------------------------------------------------------------------------

# 48. Минимальный набор изменений для recursive GUI

Рекомендуемые изменения:

``` text
1. contract/types/config.ts
       добавить ConfigSection
       добавить sections?: ConfigSection[]

2. gui/widgets/ParamRadio.tsx
       настоящий radio group

3. gui/widgets/ConfigSection.tsx
       визуальная секция

4. gui/ConfigPanel.tsx
       recursive renderer

5. gui/index.ts
       экспортировать новые публичные компоненты,
       если они должны быть публичными
```

Не нужно без необходимости менять:

``` text
IAutomaton
RuntimeV02
LoopController
EventBus
CanvasGridRenderer
AutomatonEngine
```

для самой задачи секций.

------------------------------------------------------------------------

# 49. Что не следует делать

## Не делать ConfigSchema полностью рекурсивным вместо sections

Плохая идея:

``` ts
params: {
  forest: {
    params: ...
  }
}
```

Это смешивает:

``` text
configuration model
```

и

``` text
presentation hierarchy
```

## Не делать отдельный React-компонент для каждого автомата

Плохо:

``` text
CriticalForestPanel.tsx
MazePanel.tsx
LifePanel.tsx
```

если эти панели существуют только для отображения `ConfigSchema`.

GUI должен оставаться декларативным.

## Не переносить бизнес-логику в ConfigPanel

ConfigPanel не должен знать:

``` text
что такое пожар
что такое лес
что такое гравитация
что такое клетка
```

Он знает только:

``` text
ParamDef
ActionDef
ConfigSection
```

------------------------------------------------------------------------

# 50. Что должен делать будущий агент при изменении API

Перед изменением:

1.  Найти контракт.
2.  Найти runtime, который его использует.
3.  Найти GUI, который его визуализирует.
4.  Найти renderer, если изменение касается RenderData.
5.  Найти существующие автоматы.
6.  Проверить обратную совместимость.
7.  Только после этого менять код.

------------------------------------------------------------------------

# 51. Правило проверки интерфейсов

Если пользователь присылает реальный класс:

``` text
не переписывать интерфейс по памяти
```

Нужно использовать фактический код.

Особенно проверять:

-   сигнатуры;
-   callback-и;
-   порядок вызовов;
-   типы;
-   существующие поля;
-   cleanup;
-   экспорт.

Документация описывает архитектуру, но реальный исходный код является
источником истины для конкретной реализации.

------------------------------------------------------------------------

# 52. Правило работы с неизвестным кодом

Если отсутствует:

``` text
AutomatonEngine.ts
```

не следует придумывать его реализацию.

Нужно попросить файл.

Особенно это важно для:

-   resize;
-   schema changed;
-   runtime state;
-   cleanup;
-   event subscription;
-   dynamic import;
-   compilation.

------------------------------------------------------------------------

# 53. Правило для будущих автоматов

Каждый новый автомат должен:

``` text
export default class Name
```

и реализовывать:

``` text
getApiVersion
getConfigSchema
getConfig
setConfig
init
iterate
render
runAction
destroy
```

Минимальный шаблон:

``` ts
export default class MyAutomaton {
  getApiVersion() {}
  getConfigSchema() {}
  getConfig() {}
  setConfig(_) {}
  init(_) {}
  iterate(_) {}
  render() {}
  runAction(_, __) {}
  destroy() {}
}
```

------------------------------------------------------------------------

# 54. Проверочный список автомата

Перед передачей автомата в систему:

``` text
[ ] export default class
[ ] API version = "0.2"
[ ] все 9 методов существуют
[ ] schema валиден
[ ] params соответствуют фактическим значениям
[ ] defaults корректны
[ ] actions совпадают с runAction()
[ ] init создаёт состояние
[ ] iterate не рисует
[ ] render возвращает корректный RenderData
[ ] destroy освобождает массивы/ресурсы
[ ] нет DOM
[ ] нет React
[ ] нет Canvas
[ ] нет импортов из GUI/runtime
```

------------------------------------------------------------------------

# 55. Проверочный список recursive GUI

``` text
[ ] старые плоские schema продолжают работать
[ ] sections опциональны
[ ] section может содержать params
[ ] section может содержать actions
[ ] section может содержать sections
[ ] вложенные sections рендерятся рекурсивно
[ ] ParamRadio является настоящим radio group
[ ] disabled/editable работает
[ ] description отображается
[ ] action вызывает правильный actionId
[ ] изменение параметра вызывает onParamChange
[ ] динамическая schema перестраивает GUI
[ ] нет циклической структуры sections
[ ] одинаковый parameter ID не должен случайно дублироваться
```

------------------------------------------------------------------------

# 56. Правило уникальности

`ParamDef` идентифицируется глобальным ключом:

``` text
params["forestDensity"]
```

Поэтому ID параметра должен быть уникален в рамках schema.

Для секций:

``` text
section.id
```

должен быть уникален в рамках дерева.

GUI не должен использовать человеческий `label` как идентификатор.

Плохо:

``` text
id = label
```

Хорошо:

``` text
id = "forest-growth"
label = "Восстановление"
```

------------------------------------------------------------------------

# 57. Правило стабильности ключей React

При рекурсивном renderer:

``` text
key должен быть стабильным
```

Рекомендуется:

``` text
section:${section.id}
param:${key}
action:${id}
```

Для одинаковых ID на разных уровнях можно использовать путь:

``` text
forest/forest-growth
```

------------------------------------------------------------------------

# 58. Динамический GUI

При изменении schema:

``` text
old schema
     ↓
setConfig()
     ↓
new schema
     ↓
runtime emits schema:changed
     ↓
React setSchema()
     ↓
ConfigPanel
     ↓
new tree
```

Нельзя оставлять старый React tree только потому, что `params` были
изменены.

------------------------------------------------------------------------

# 59. Что относится к runtime, а что к automaton

## Runtime

``` text
speed
fps
paused
renderEveryN
requestAnimationFrame
loop
EventBus
renderer
```

## Automaton

``` text
density
temperature
gravity
forestDensity
fireSpread
cell state
simulation rules
palette
domain-specific actions
```

## GUI

``` text
Card
Label
Slider
Radio
Select
Checkbox
Button
Section
```

------------------------------------------------------------------------

# 60. Как мыслить о проекте

Главная модель:

``` text
Automaton
    =
    pure-ish simulation module
```

``` text
Runtime
    =
    execution environment
```

``` text
Renderer
    =
    visualization adapter
```

``` text
Engine
    =
    composition/orchestration
```

``` text
GUI
    =
    declarative control surface
```

------------------------------------------------------------------------

# 61. Основной поток данных

``` text
             CONFIG
                │
                ▼
        ┌────────────────┐
        │   ConfigPanel  │
        └───────┬────────┘
                │
                ▼
             Engine
                │
                ▼
             Runtime
                │
                ▼
           setConfig()
                │
                ▼
           Automaton
```

Рендер:

``` text
Automaton
    │
    │ render()
    ▼
RenderData
    │
    ▼
EventBus
    │
    ▼
Renderer
    │
    ▼
Canvas
```

События:

``` text
Automaton
    │
    │ runtime.emitEvent()
    ▼
EventBus
    │
    ▼
EventLogPanel
```

------------------------------------------------------------------------

# 62. Полный dependency graph

``` text
React Router
      │
      ▼
AutomatonView
      │
      ▼
useAutomatonEngine
      │
      ▼
AutomatonEngine
      │
      ├───────────────┐
      ▼               ▼
RuntimeV02       CanvasGridRenderer
      │               │
      ▼               │
LoopController        │
      │               │
      ▼               │
IAutomaton            │
      │               │
      └──────┬────────┘
             │
         RenderData
             │
          EventBus
             │
       ┌─────┴─────┐
       ▼           ▼
     GUI         Renderer
```

------------------------------------------------------------------------

# 63. Главный инвариант

Если изменение можно сделать:

``` text
только в Automaton
```

--- сначала делаем его там.

Если изменение касается:

``` text
визуализации
```

--- меняем renderer.

Если касается:

``` text
конфигурационного UI
```

--- меняем contract + ConfigPanel/widgets.

Если касается:

``` text
execution lifecycle
```

--- runtime/engine.

Не следует менять несколько слоёв без необходимости.

------------------------------------------------------------------------

# 64. Текущее состояние работы

На данный момент логически выполнены/запланированы:

### Уже определено

-   recursive sections;
-   `ConfigSection`;
-   настоящий `ParamRadio`;
-   dynamic schema;
-   simple/advanced GUI;
-   тестовый Critical Forest;
-   тематическая структура параметров;
-   actions;
-   palettes.

### Требует реальной интеграции/проверки

-   фактический `ConfigSection.tsx`;
-   фактический `ParamRadio.tsx`;
-   фактический recursive `ConfigPanel.tsx`;
-   фактическое добавление `sections` в `config.ts`;
-   обработка `schema:changed` в engine/hook;
-   изменение canvas при динамическом размере мира;
-   реальный runtime flow после `setConfig()`;
-   типизация recursive schema;
-   тесты.

------------------------------------------------------------------------

# 65. Особенно важное замечание о текущем CriticalForest

Предоставленный ранее CriticalForest использует:

``` ts
sections: [...]
```

но исходный пользовательский `ConfigSchema` ещё не содержит:

``` ts
sections?: ConfigSection[]
```

Поэтому нельзя считать этот автомат полностью совместимым с текущим
TypeScript-контрактом до завершения расширения `config.ts`.

Это намеренно: CriticalForest является тестом требуемого нового API.

------------------------------------------------------------------------

# 66. Что проверить в следующем шаге

Для полноценной интеграции необходимо получить реальные реализации:

``` text
AutomatonEngine.ts
useAutomatonEngine.ts
BaseRuntimeProgram.ts
RuntimeV02.ts
LoopController.ts
CanvasGridRenderer.ts
```

Особенно важны:

``` text
1. как runtime получает новый ConfigSchema;
2. как engine обновляет React schema;
3. как resize проходит до renderer;
4. как initial grid size определяется;
5. как reset вызывает init/destroy;
6. как EventBus подписывается и отписывается;
7. как compile/loadProgram обрабатывает динамический код.
```

------------------------------------------------------------------------

# 67. Тест-план

## Test 1 --- старый автомат

Автомат без `sections`.

Ожидание:

``` text
старый GUI работает
```

## Test 2 --- один section

``` text
World
 ├── width
 └── height
```

## Test 3 --- nested section

``` text
Forest
 └── Moisture
     └── Advanced
```

## Test 4 --- radio

Проверить:

``` text
один selected option
```

и отсутствие dropdown.

## Test 5 --- action inside section

Нажатие должно передавать:

``` text
actionId
```

без изменений.

## Test 6 --- dynamic schema

``` text
simple → advanced
advanced → simple
```

## Test 7 --- resize

``` text
100×70
→
150×100
→
50×40
```

## Test 8 --- render palette

``` text
natural
→ contrast
→ mono
```

## Test 9 --- event log

Проверить:

``` text
info
warning
error
```

## Test 10 --- destroy

Проверить отсутствие:

``` text
requestAnimationFrame
EventBus listeners
references to old automaton
```

------------------------------------------------------------------------

# 68. Производительность

Поскольку система работает в браузере, нельзя бездумно делать:

``` text
React render на каждую клетку
```

или:

``` text
React state = весь массив клеток
```

Сетка должна оставаться в typed array и передаваться renderer'у.

Правильная схема:

``` text
Uint8Array
    ↓
CanvasGridRenderer
```

а не:

``` text
Uint8Array
    ↓
React components × millions
```

------------------------------------------------------------------------

# 69. requestAnimationFrame

Runtime должен учитывать:

``` text
simulation speed
target FPS
maxIterationsPerFrame
renderEveryN
```

Иначе при слишком высокой скорости возможна:

``` text
spiral of death
```

То есть браузер не успевает обработать накопившиеся шаги.

------------------------------------------------------------------------

# 70. Безопасность и изоляция

Так как исходный код автомата приходит с сервера и исполняется в
браузере, будущему агенту нельзя предполагать, что такой код
автоматически безопасен.

Документация описывает изоляцию по архитектурному контракту:

``` text
no DOM
no React
no Canvas
no imports
```

Но это не является полноценным sandboxing/security boundary само по
себе.

Если в будущем появится требование запускать недоверенный
пользовательский код, нужно отдельно проектировать:

-   Web Worker;
-   iframe sandbox;
-   CSP;
-   ограничение globals;
-   timeout;
-   memory/resource limits;
-   communication protocol.

Не смешивать это с обычной API v0.2 архитектурой без отдельного решения.

------------------------------------------------------------------------

# 71. Что считать breaking change

Breaking change:

``` text
изменение сигнатуры IAutomaton
изменение семантики init()
изменение RenderData
удаление ParamDef.ui
изменение значения apiVersion
изменение lifecycle
```

Обычно не breaking:

``` text
новый optional field
новый widget
новая optional section
новый action
новая palette
```

При этом optional расширения всё равно должны быть поддержаны
runtime/GUI.

------------------------------------------------------------------------

# 72. Как расширять API правильно

Если нужна новая функция:

``` text
1. определить сущность;
2. определить интерфейс;
3. определить направление зависимости;
4. определить lifecycle;
5. добавить backward-compatible optional field;
6. обновить GUI/runtime;
7. добавить тестовый автомат;
8. обновить документацию.
```

------------------------------------------------------------------------

# 73. Рекомендованный стиль изменений

Изменения должны быть:

``` text
локальными
типизированными
backward-compatible
декларативными
без бизнес-логики в GUI
без GUI-зависимостей в automaton
```

------------------------------------------------------------------------

# 74. Что агент должен запросить у пользователя

Если задача касается только автомата:

``` text
CriticalForest.ts
```

достаточно.

Если задача касается GUI:

``` text
config.ts
ConfigPanel.tsx
widgets/*
```

Если задача касается runtime:

``` text
BaseRuntimeProgram.ts
RuntimeV02.ts
LoopController.ts
EventBus.ts
```

Если задача касается размера/Canvas:

``` text
CanvasGridRenderer.ts
AutomatonEngine.ts
useAutomatonEngine.ts
```

Если задача касается загрузки пользовательского кода:

``` text
loadProgram
compileTypeScript
validateProgram
useAutomatonEngine
```

------------------------------------------------------------------------

# 75. Главная инструкция будущему агенту

Перед написанием кода ответить себе на пять вопросов:

``` text
1. В каком слое находится проблема?

2. Какой существующий интерфейс является контрактом?

3. Кто владеет изменяемым объектом?

4. Через какой канал изменение должно пройти?

5. Можно ли решить задачу без изменения нижележащего слоя?
```

Если на эти вопросы нет ответа --- сначала запросить соответствующий
исходный файл.

------------------------------------------------------------------------

# 76. Краткая памятка

``` text
IAutomaton
    = пользовательская симуляция

ConfigSchema
    = декларативное описание конфигурации

ConfigSection
    = декларативное расположение параметров/actions

ConfigPanel
    = recursive renderer schema

ParamRadio
    = настоящий radio UI

EventBus
    = транспорт событий

Runtime
    = lifecycle + loop

Renderer
    = RenderData → pixels

Engine
    = соединяет runtime + renderer + eventbus

React
    = внешний UI lifecycle

Browser
    = среда выполнения пользовательского автомата
```

Главный поток:

``` text
Server
 ↓
source code
 ↓
compile
 ↓
dynamic import
 ↓
IAutomaton
 ↓
Runtime
 ↓
iterate()
 ↓
render()
 ↓
RenderData
 ↓
Canvas
```

GUI поток:

``` text
ConfigSchema
 ↓
ConfigPanel
 ↓
user input
 ↓
Engine
 ↓
Runtime
 ↓
setConfig()
 ↓
Automaton
```

События:

``` text
Automaton
 ↓
IRuntimeCallback
 ↓
EventBus
 ↓
GUI
```

------------------------------------------------------------------------

# 77. Финальная цель текущей ветки разработки

Получить стабильную декларативную систему, в которой автомат может
описать сложный интерфейс примерно так:

``` text
ConfigSchema
 ├── parameters
 ├── actions
 └── sections
      ├── parameters
      ├── actions
      └── sections
           └── ...
```

при этом:

``` text
старые автоматы
    ↓
не ломаются

новые автоматы
    ↓
получают богатый recursive GUI
```

А конкретная предметная логика остаётся внутри автомата.

Это должно позволить создавать сложные клеточные автоматы без написания
отдельного React UI для каждого автомата.
