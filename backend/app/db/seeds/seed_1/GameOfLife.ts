// game_of_life.ts — исходный код для базы данных / сервера

export default class GameOfLife {
  private grid = new Uint8Array(0);
  private next = new Uint8Array(0);
  private width = 0;
  private height = 0;
  private config = {
    density: 0.3,
    wrapEdges: true,
  };

  getApiVersion() {
    return "0.2";
  }

  getConfigSchema() {
    return {
      name: "Game of Life",
      description: "Классический клеточный автомат Конвея (API v0.2)",
      apiVersion: "0.2",
      params: {
        density: {
          type: "number",
          default: 0.3,
          label: "Начальная плотность",
          description: "Доля живых клеток при инициализации",
          ui: "scroller",
          min: 0.05,
          max: 0.95,
          step: 0.05,
        },
        wrapEdges: {
          type: "boolean",
          default: true,
          label: "Замкнутые края",
          ui: "checkbox",
        },
      },
      actions: {
        randomize: { label: "🎲 Рандом" },
        clear: { label: "🗑 Очистить" },
        glider: { label: "✈ Глайдер" },
      },
    };
  }

  getConfig() {
    return { ...this.config };
  }

  setConfig(params) {
    Object.assign(this.config, params);
    return null;
  }

  init(ctx) {
    this.width = ctx.gridWidth;
    this.height = ctx.gridHeight;
    this.grid = new Uint8Array(this.width * this.height);
    this.next = new Uint8Array(this.width * this.height);
    this.randomize();
  }

  iterate(_ctx) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const alive = this.grid[y * this.width + x] === 1;
        this.next[y * this.width + x] =
          alive
            ? (neighbors === 2 || neighbors === 3 ? 1 : 0)
            : (neighbors === 3 ? 1 : 0);
      }
    }
    const tmp = this.grid;
    this.grid = this.next;
    this.next = tmp;
  }

  render() {
    return {
      type: "grid",
      width: this.width,
      height: this.height,
      cells: this.grid,
      palette: ["#0f172a", "#22c55e"],
    };
  }

  runAction(actionId) {
    switch (actionId) {
      case "randomize": this.randomize(); break;
      case "clear": this.grid.fill(0); break;
      case "glider": this.placeGlider(); break;
    }
  }

  destroy() {
    this.grid = new Uint8Array(0);
    this.next = new Uint8Array(0);
  }

  // ─── Внутренние методы ───

  randomize() {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = Math.random() < this.config.density ? 1 : 0;
    }
  }

  countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        let nx = x + dx;
        let ny = y + dy;
        if (this.config.wrapEdges) {
          nx = (nx + this.width) % this.width;
          ny = (ny + this.height) % this.height;
        } else if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          continue;
        }
        count += this.grid[ny * this.width + nx];
      }
    }
    return count;
  }

  placeGlider() {
    this.grid.fill(0);
    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);
    const pattern = [[0,1],[1,2],[2,0],[2,1],[2,2]];
    for (const [dy, dx] of pattern) {
      const x = (cx + dx) % this.width;
      const y = (cy + dy) % this.height;
      this.grid[y * this.width + x] = 1;
    }
  }
}