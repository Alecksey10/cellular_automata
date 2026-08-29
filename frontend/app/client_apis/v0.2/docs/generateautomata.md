Ты — разработчик клеточных автоматов. Напиши класс клеточного автомата,
совместимый с API v0.2.

═══════════════════════════════════════════════════════════════
ФОРМАТ ВЫВОДА
═══════════════════════════════════════════════════════════════

- Один файл TypeScript/JavaScript.
- Единственный экспорт: `export default class MyAutomaton { ... }`
- НЕ используй `import` из внешних модулей.
- НЕ обращайся к DOM, window, document, canvas, console.
- НЕ используй `new GameOfLife()` в конце — только `export default class`.
- Код будет скомпилирован и выполнен в изолированной среде браузера.

═══════════════════════════════════════════════════════════════
ОБЯЗАТЕЛЬНЫЕ МЕТОДЫ (все 9)
═══════════════════════════════════════════════════════════════

1. getApiVersion(): string
   - Всегда возвращай "0.2".

2. getConfigSchema(): object
   - Возвращает описание конфигурации для автоматической генерации GUI.
   - Формат:
     {
       name: string,           // Название автомата
       description: string,    // Краткое описание
       apiVersion: "0.2",
       params: {
         [key: string]: {
           type: "number" | "string" | "boolean",
           default: number | string | boolean,
           label?: string,          // Отображаемое имя
           description?: string,    // Подсказка
           ui: "scroller" | "input" | "combobox" | "checkbox" | "radio",
           options?: string[],      // Для combobox/radio
           min?: number,            // Для scroller
           max?: number,            // Для scroller
           step?: number,           // Для scroller
           editable?: boolean,      // false = заблокирован (по умолчанию true)
         }
       },
       actions: {
         [actionId: string]: {
           label: string,           // Текст на кнопке
           description?: string,    // Подсказка
         }
       }
     }

3. getConfig(): object
   - Возвращает текущие значения всех параметров.
   - Пример: return { density: 0.3, wrapEdges: true };

4. setConfig(params: object): object | null
   - Принимает частичный объект с изменёнными параметрами.
   - Применяет их к внутренней конфигурации.
   - Возвращает НОВЫЙ ConfigSchema, если схема изменилась
     (например, появились/скрылись параметры).
   - Возвращает null, если схема не изменилась.

5. init(context: object): void
   - Вызывается один раз перед началом симуляции.
   - context имеет структуру:
     {
       gridWidth: number,      // Ширина сетки в ячейках (обычно 100)
       gridHeight: number,     // Высота сетки в ячейках (обычно 100)
       runtime: {              // Объект для обратной связи со средой
         emitEvent(event: { type: "info"|"warning"|"error"|"request", message: string }): void,
         requestStop(): void,
         requestPause(): void,
         requestSpeedChange(factor: number): void,
         requestRenderIntervalChange(n: number): void,
       }
     }
   - Сохрани context.runtime для последующего использования.
   - Создай внутренние массивы данных (сетку, буферы) на основе gridWidth/gridHeight.

6. iterate(ctx: object): void
   - Вызывается на каждом тике симуляции (может быть много раз за кадр).
   - ctx имеет структуру:
     {
       step: number,       // Номер итерации (начинается с 1)
       time: number,       // Текущее время в мс (performance.now)
       deltaTime: number,  // Длительность одного шага в мс
     }
   - Здесь ТОЛЬКО обновляй состояние симуляции. НЕ рисуй.

7. render(): object | null
   - Вызывается периодически для получения кадра.
   - Возвращает данные для отрисовки в одном из двух форматов:

     Формат А — сетка (рекомендуется):
     {
       type: "grid",
       width: number,          // Ширина сетки
       height: number,         // Высота сетки
       cells: Uint8Array,      // Состояния ячеек, row-major, длина = width * height
       palette?: string[],     // Массив CSS-цветов: palette[0] = цвет для cells[i]=0
     }

     Формат Б — сырые пиксели:
     {
       type: "raw",
       width: number,
       height: number,
       data: Uint8ClampedArray, // RGBA-пиксели, длина = width * height * 4
     }

   - Возвращай null, если рисовать нечего.

8. runAction(actionId: string, payload?: any): void
   - Вызывается при нажатии кнопки действия в GUI.
   - actionId — ключ из actions в ConfigSchema.
   - Реализуй логику каждого действия через switch/case.

9. destroy(): void
   - Вызывается при остановке/размонтировании.
   - Освободи все массивы и ссылки.

═══════════════════════════════════════════════════════════════
ОБРАТНАЯ СВЯЗЬ СО СРЕДОЙ (через this.runtime)
═══════════════════════════════════════════════════════════════

После сохранения context.runtime в init(), ты можешь вызывать:

  this.runtime.emitEvent({ type: "info", message: "Сообщение" })
    → Отобразится в логе событий. Типы: "info", "warning", "error", "request".
    → При type: "error" симуляция автоматически встанет на паузу.

  this.runtime.requestPause()
    → Поставит симуляцию на паузу. Пользователь сможет возобновить.

  this.runtime.requestStop()
    → Полностью остановит симуляцию.

  this.runtime.requestSpeedChange(factor)
    → Изменит скорость. 1.0 = норма, 0.5 = вдвое медленнее, 2.0 = вдвое быстрее.

  this.runtime.requestRenderIntervalChange(n)
    → Рендерить каждые N итераций. 1 = каждый кадр, 10 = каждый 10-й.

Используй optional chaining для безопасности: this.runtime?.requestPause()

═══════════════════════════════════════════════════════════════
ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

✅ МОЖНО:
  - Создавать и использовать Uint8Array, Uint32Array, Float32Array
  - Использовать Math.random(), Math.floor() и прочую математику
  - Хранить состояние в полях класса
  - Вызывать this.runtime?.* для управления средой
  - Менять ConfigSchema динамически (возвращая новую из setConfig)

❌ НЕЛЬЗЯ:
  - import/require внешних модулей
  - Обращаться к DOM, document, window, canvas
  - Использовать setTimeout/setInterval (используй iterate)
  - Делать сетевые запросы (fetch, XMLHttpRequest)
  - Использовать Web Workers, SharedArrayBuffer
  - Вызывать alert(), confirm(), prompt()

═══════════════════════════════════════════════════════════════
ШАБЛОН
═══════════════════════════════════════════════════════════════

export default class MyAutomaton {
  grid = new Uint8Array(0);
  width = 0;
  height = 0;
  runtime = null;
  config = { /* начальные значения */ };

  getApiVersion() { return "0.2"; }

  getConfigSchema() {
    return {
      name: "Мой автомат",
      description: "Описание",
      apiVersion: "0.2",
      params: {
        // параметры для GUI
      },
      actions: {
        // кнопки для GUI
      },
    };
  }

  getConfig() { return { ...this.config }; }

  setConfig(params) {
    Object.assign(this.config, params);
    return null; // или новая схема, если изменилась
  }

  init(ctx) {
    this.runtime = ctx.runtime;
    this.width = ctx.gridWidth;
    this.height = ctx.gridHeight;
    this.grid = new Uint8Array(this.width * this.height);
    // начальная инициализация
  }

  iterate(ctx) {
    // логика одного шага симуляции
  }

  render() {
    return {
      type: "grid",
      width: this.width,
      height: this.height,
      cells: this.grid,
      palette: ["#000000", "#ffffff"],
    };
  }

  runAction(actionId) {
    switch (actionId) {
      // обработка кнопок
    }
  }

  destroy() {
    this.grid = new Uint8Array(0);
    this.runtime = null;
  }
}

═══════════════════════════════════════════════════════════════
ЗАДАНИЕ
═══════════════════════════════════════════════════════════════

Напиши клеточный автомат: [ОПИСАНИЕ ЖЕЛАЕМОГО АВТОМАТА]

Требования:
- [СПИСОК ДОПОЛНИТЕЛЬНЫХ ТРЕБОВАНИЙ]