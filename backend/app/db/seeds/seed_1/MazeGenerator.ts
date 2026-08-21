// maze_generator.ts — генератор лабиринтов с чёткой визуализацией процесса

export default class MazeGenerator {
  // Основной массив: 0 — стена, 1 — проход
  grid = new Uint8Array(0);

  // Слой ролей: 0 — нет, 1 — текущая, 2 — только что открытая, 3 — во фронте, 4 — путь к текущей
  roles = new Uint8Array(0);

  width = 0;
  height = 0;
  runtime = null;

  // Стек / очередь для генерации
  frontier = [];
  currentCell = null;   // последняя обработанная ячейка
  recentCells = [];     // недавно открытые (постепенно затухают)
  visitedCount = 0;
  totalCells = 0;
  generating = false;
  done = false;

  config = {
    algorithm: "dfs",
    geometry: "orthogonal",
    stepSize: 2,
    branchChance: 0.5,
    animationSpeed: 1,
    fadeTrail: 8,
    showFrontier: true,
    highlightCurrent: true,
  };

  getApiVersion() {
    return "0.2";
  }

  getConfigSchema() {
    return this.buildSchema();
  }

  buildSchema() {
    const base = {
      name: "🧩 Генератор лабиринтов",
      description: "Пошаговая визуализация: красный — текущая ячейка, оранжевые — только что открытые, синие — фронт (кандидаты).",
      apiVersion: "0.2",
      params: {
        algorithm: {
          type: "string",
          default: "dfs",
          label: "Алгоритм",
          description: "Способ выбора следующей ячейки из фронта",
          ui: "combobox",
          options: ["dfs", "bfs", "prim", "kruskal", "eller"],
        },
        geometry: {
          type: "string",
          default: "orthogonal",
          label: "Геометрия",
          description: "Тип соседства ячеек",
          ui: "combobox",
          options: ["orthogonal", "hex", "diagonal"],
        },
        stepSize: {
          type: "number",
          default: 2,
          label: "Размер шага",
          description: "Расстояние между ячейками (чётное)",
          ui: "scroller",
          min: 2,
          max: 6,
          step: 2,
        },
        animationSpeed: {
          type: "number",
          default: 1,
          label: "Шагов за итерацию",
          description: "1 = очень медленно, видно каждый шаг. Больше = быстрее.",
          ui: "scroller",
          min: 1,
          max: 50,
          step: 1,
        },
        fadeTrail: {
          type: "number",
          default: 8,
          label: "Длина шлейфа",
          description: "Сколько шагов подсвечиваются недавно открытые ячейки",
          ui: "scroller",
          min: 0,
          max: 30,
          step: 1,
        },
        branchChance: {
          type: "number",
          default: 0.5,
          label: "Шанс ветвления",
          description: "Вероятность создать ответвление (только DFS)",
          ui: "scroller",
          min: 0,
          max: 1,
          step: 0.05,
        },
        showFrontier: {
          type: "boolean",
          default: true,
          label: "Показывать фронт",
          description: "Подсвечивать ячейки-кандидаты синим",
          ui: "checkbox",
        },
        highlightCurrent: {
          type: "boolean",
          default: true,
          label: "Подсвечивать текущую",
          description: "Ярко-красным отметить обрабатываемую ячейку",
          ui: "checkbox",
        },
      },
      actions: {
        generate: { label: "🔄 Новый лабиринт" },
        stepOnce: { label: "👣 Один шаг" },
        step10: { label: "👣×10 Десять шагов" },
        finishNow: { label: "⏩ Достроить мгновенно" },
        clearPath: { label: "🧹 Убрать проходы" },
        invertMaze: { label: "🔁 Инвертировать" },
        addRandomHoles: { label: "🕳 Добавить дыр" },
        solveEntrance: { label: "🚪 Найти вход/выход" },
      },
    };

    if (this.config.algorithm !== "dfs") {
      delete base.params.branchChance;
    }

    if (this.config.geometry === "hex") {
      base.params.stepSize.editable = false;
      base.params.stepSize.description = "Для hex-геометрии шаг фиксирован = 2";
    }

    return base;
  }

  getConfig() {
    return { ...this.config };
  }

  setConfig(params) {
    const oldAlgorithm = this.config.algorithm;
    const oldGeometry = this.config.geometry;

    Object.assign(this.config, params);

    if (params.algorithm && params.algorithm !== oldAlgorithm && this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: `Алгоритм: ${oldAlgorithm} → ${this.config.algorithm}`,
      });
    }

    if (params.geometry && params.geometry !== oldGeometry && this.runtime) {
      this.runtime.emitEvent({
        type: "warning",
        message: `Геометрия изменена на "${this.config.geometry}". Рекомендуется перегенерировать.`,
      });
    }

    if (
      (params.algorithm && params.algorithm !== oldAlgorithm) ||
      (params.geometry && params.geometry !== oldGeometry)
    ) {
      return this.buildSchema();
    }

    return null;
  }

  init(ctx) {
    this.width = ctx.gridWidth;
    this.height = ctx.gridHeight;
    this.runtime = ctx.runtime;
    this.grid = new Uint8Array(this.width * this.height);
    this.roles = new Uint8Array(this.width * this.height);
    this.startGeneration();

    this.runtime.emitEvent({
      type: "info",
      message: `Лабиринт ${this.width}×${this.height}, алгоритм: ${this.config.algorithm}`,
    });
  }

  iterate(_ctx) {
    if (!this.generating || this.done) return;

    const steps = this.config.animationSpeed;
    for (let i = 0; i < steps; i++) {
      if (this.done || this.frontier.length === 0) {
        this.finishGeneration();
        return;
      }
      this.generationStep();
    }

    // Обновляем шлейф после всех шагов итерации
    this.updateTrail();
  }

  render() {
    // Собираем итоговый массив: комбинируем grid и roles
    const cells = new Uint8Array(this.grid.length);

    for (let i = 0; i < this.grid.length; i++) {
      const role = this.roles[i];
      const base = this.grid[i];

      if (role === 1 && this.config.highlightCurrent) {
        cells[i] = 4; // текущая — ярко-красный
      } else if (role >= 2 && role <= 10) {
        // Затухающий шлейф: от оранжевого к прозрачному
        cells[i] = 5 + Math.min(role - 2, 3); // 5, 6, 7, 8 — градация оранжевого
      } else if (role === 20 && this.config.showFrontier) {
        cells[i] = 3; // фронт — синий
      } else if (role === 30) {
        cells[i] = 9; // путь входа/выхода — жёлтый
      } else {
        cells[i] = base; // просто стена или проход
      }
    }

    return {
      type: "grid",
      width: this.width,
      height: this.height,
      cells: cells,
      palette: [
        "#1a1a2e",  // 0 — стена (тёмно-синий)
        "#f5f5f5",  // 1 — проход (белый)
        "#1a1a2e",  // 2 — резерв
        "#4a9eff",  // 3 — фронт (голубой)
        "#ff3333",  // 4 — текущая ячейка (ярко-красный)
        "#ff6b35",  // 5 — шлейф яркий (оранжевый)
        "#ff9558",  // 6 — шлейф средний
        "#ffb88c",  // 7 — шлейф слабый
        "#ffd9c0",  // 8 — шлейф едва заметный
        "#ffd93d",  // 9 — путь / вход-выход (жёлтый)
      ],
    };
  }

  runAction(actionId) {
    switch (actionId) {
      case "generate":
        this.startGeneration();
        if (this.runtime) {
          this.runtime.emitEvent({
            type: "info",
            message: `Старт: ${this.config.algorithm}, ${this.config.geometry}`,
          });
        }
        break;

      case "stepOnce":
        this.doManualSteps(1);
        break;

      case "step10":
        this.doManualSteps(10);
        break;

      case "finishNow":
        this.finishInstantly();
        break;

      case "clearPath":
        this.clearPaths();
        break;

      case "invertMaze":
        this.invertGrid();
        break;

      case "addRandomHoles":
        this.addHoles();
        break;

      case "solveEntrance":
        this.markEntranceExit();
        break;
    }
  }

  destroy() {
    this.grid = new Uint8Array(0);
    this.roles = new Uint8Array(0);
    this.frontier = [];
    this.recentCells = [];
    this.runtime = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Генерация
  // ═══════════════════════════════════════════════════════════════════════

  startGeneration() {
    this.grid.fill(0);
    this.roles.fill(0);
    this.frontier = [];
    this.recentCells = [];
    this.currentCell = null;
    this.visitedCount = 0;
    this.done = false;
    this.generating = true;

    const step = this.getStepSize();
    const startX = step;
    const startY = step;

    this.setCell(startX, startY, 1);
    this.visitedCount++;

    // Считаем общее количество ячеек
    this.totalCells = 0;
    for (let y = step; y < this.height - 1; y += step) {
      for (let x = step; x < this.width - 1; x += step) {
        this.totalCells++;
      }
    }

    // Начальные соседи во фронт
    const neighbors = this.getUnvisitedNeighbors(startX, startY);
    for (const [nx, ny] of neighbors) {
      this.frontier.push({ x: startX, y: startY, nx, ny });
      this.setRole(nx, ny, 20); // помечаем как фронт
    }
  }

  generationStep() {
    if (this.frontier.length === 0) return;

    let index;
    switch (this.config.algorithm) {
      case "dfs":
        if (Math.random() > this.config.branchChance && this.frontier.length > 1) {
          index = Math.floor(Math.random() * this.frontier.length);
        } else {
          index = this.frontier.length - 1;
        }
        break;
      case "bfs":
        index = 0;
        break;
      case "prim":
      case "kruskal":
        index = Math.floor(Math.random() * this.frontier.length);
        break;
      case "eller":
        index = Math.random() < 0.7
          ? this.frontier.length - 1
          : Math.floor(Math.random() * this.frontier.length);
        break;
      default:
        index = this.frontier.length - 1;
    }

    const edge = this.frontier[index];
    this.frontier.splice(index, 1);

    // Ячейка уже посещена — просто убираем метку фронта
    if (this.getCell(edge.nx, edge.ny) === 1) {
      // Если она уже проход, но всё ещё во фронте — сбрасываем роль
      if (this.getRole(edge.nx, edge.ny) === 20) {
        this.setRole(edge.nx, edge.ny, 0);
      }
      return;
    }

    // Убираем метку "текущая" с предыдущей ячейки
    if (this.currentCell) {
      const [px, py] = this.currentCell;
      if (this.getRole(px, py) === 1) {
        this.setRole(px, py, 2); // переводим в начало шлейфа
        this.recentCells.push({ x: px, y: py, age: 2 });
      }
    }

    // Прокладываем проход
    const wallX = Math.floor((edge.x + edge.nx) / 2);
    const wallY = Math.floor((edge.y + edge.ny) / 2);

    this.setCell(wallX, wallY, 1);
    this.setCell(edge.nx, edge.ny, 1);

    // Помечаем стену тоже как часть шлейфа
    this.setRole(wallX, wallY, 2);
    this.recentCells.push({ x: wallX, y: wallY, age: 2 });

    // Помечаем новую ячейку как текущую
    this.setRole(edge.nx, edge.ny, 1);
    this.currentCell = [edge.nx, edge.ny];
    this.visitedCount++;

    // Добавляем новых соседей во фронт
    const neighbors = this.getUnvisitedNeighbors(edge.nx, edge.ny);
    for (const [nnx, nny] of neighbors) {
      this.frontier.push({ x: edge.nx, y: edge.ny, nx: nnx, ny: nny });
      if (this.getRole(nnx, nny) === 0) {
        this.setRole(nnx, nny, 20);
      }
    }
  }

  updateTrail() {
    // Продвигаем возраст шлейфа
    const maxAge = this.config.fadeTrail;
    const newRecent = [];

    for (const cell of this.recentCells) {
      cell.age++;
      if (cell.age > maxAge || cell.age > 10) {
        // Убираем роль — станет обычным проходом
        if (this.getRole(cell.x, cell.y) >= 2 && this.getRole(cell.x, cell.y) <= 10) {
          this.setRole(cell.x, cell.y, 0);
        }
      } else {
        this.setRole(cell.x, cell.y, cell.age);
        newRecent.push(cell);
      }
    }

    this.recentCells = newRecent;
  }

  doManualSteps(count) {
    if (this.done || this.frontier.length === 0) {
      if (this.runtime) {
        this.runtime.emitEvent({
          type: "warning",
          message: "Генерация уже завершена. Нажмите «Новый лабиринт».",
        });
      }
      return;
    }

    for (let i = 0; i < count; i++) {
      if (this.frontier.length === 0) break;
      this.generationStep();
    }
    this.updateTrail();

    if (this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: `👣 Выполнено шагов: ${count}. Осталось во фронте: ${this.frontier.length}`,
      });
    }
  }

  finishGeneration() {
    this.generating = false;
    this.done = true;
    this.currentCell = null;

    // Очищаем все роли
    this.roles.fill(0);
    this.recentCells = [];

    if (this.runtime) {
      const percent = ((this.visitedCount / this.totalCells) * 100).toFixed(1);
      this.runtime.emitEvent({
        type: "info",
        message: `✅ Готово! Покрытие: ${percent}% (${this.visitedCount}/${this.totalCells})`,
      });
    }
  }

  finishInstantly() {
    const maxIter = this.width * this.height;
    let iter = 0;
    while (this.frontier.length > 0 && iter < maxIter) {
      this.generationStep();
      iter++;
    }
    this.finishGeneration();

    if (this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: `⏩ Достроено за ${iter} шагов`,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Геометрия
  // ═══════════════════════════════════════════════════════════════════════

  getStepSize() {
    if (this.config.geometry === "hex") return 2;
    return this.config.stepSize;
  }

  getUnvisitedNeighbors(x, y) {
    const step = this.getStepSize();
    const neighbors = [];
    let directions;

    switch (this.config.geometry) {
      case "orthogonal":
        directions = [[0, -step], [0, step], [-step, 0], [step, 0]];
        break;

      case "hex":
        if (y % 4 === 0) {
          directions = [
            [0, -step], [0, step],
            [-step, -1], [-step, 1],
            [step, -1], [step, 1],
          ];
        } else {
          directions = [
            [0, -step], [0, step],
            [-step, 0], [-step, step],
            [step, 0], [step, step],
          ];
        }
        break;

      case "diagonal":
        directions = [
          [0, -step], [0, step], [-step, 0], [step, 0],
          [-step, -step], [-step, step], [step, -step], [step, step],
        ];
        break;

      default:
        directions = [[0, -step], [0, step], [-step, 0], [step, 0]];
    }

    for (const [dy, dx] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1) {
        if (this.getCell(nx, ny) !== 1) {
          neighbors.push([nx, ny]);
        }
      }
    }

    this.shuffle(neighbors);
    return neighbors;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Действия
  // ═══════════════════════════════════════════════════════════════════════

  clearPaths() {
    this.grid.fill(0);
    this.roles.fill(0);
    if (this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: "🧹 Всё очищено, остались стены",
      });
    }
  }

  invertGrid() {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = this.grid[i] === 0 ? 1 : 0;
    }
    if (this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: "🔁 Инвертировано",
      });
    }
  }

  addHoles() {
    let holes = 0;
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.getCell(x, y) === 0 && Math.random() < 0.03) {
          this.setCell(x, y, 1);
          holes++;
        }
      }
    }
    if (this.runtime) {
      this.runtime.emitEvent({
        type: "info",
        message: `🕳 Добавлено ${holes} проходов`,
      });
    }
  }

  markEntranceExit() {
    let entranceX = -1;
    for (let x = 0; x < this.width; x++) {
      if (this.getCell(x, 1) === 1) {
        entranceX = x;
        break;
      }
    }

    let exitX = -1;
    for (let x = this.width - 1; x >= 0; x--) {
      if (this.getCell(x, this.height - 2) === 1) {
        exitX = x;
        break;
      }
    }

    if (entranceX >= 0) {
      this.setCell(entranceX, 0, 1);
      this.setRole(entranceX, 0, 30);
      this.setRole(entranceX, 1, 30);
    }
    if (exitX >= 0) {
      this.setCell(exitX, this.height - 1, 1);
      this.setRole(exitX, this.height - 1, 30);
      this.setRole(exitX, this.height - 2, 30);
    }

    if (this.runtime) {
      if (entranceX >= 0 && exitX >= 0) {
        this.runtime.emitEvent({
          type: "info",
          message: `🚪 Вход: (${entranceX}, 0) → Выход: (${exitX}, ${this.height - 1})`,
        });
      } else {
        this.runtime.emitEvent({
          type: "error",
          message: "Не найдены проходы у краёв",
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Утилиты
  // ═══════════════════════════════════════════════════════════════════════

  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return this.grid[y * this.width + x];
  }

  setCell(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y * this.width + x] = value;
    }
  }

  getRole(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.roles[y * this.width + x];
  }

  setRole(x, y, value) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.roles[y * this.width + x] = value;
    }
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}