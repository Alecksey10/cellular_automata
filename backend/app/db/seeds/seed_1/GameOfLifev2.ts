export default class GameOfLife {
  grid = new Uint8Array(0);
  next = new Uint8Array(0);
  width = 0;
  height = 0;
  runtime:any = null;
  config = {
    density: 0.3,
    wrapEdges: true,
  };

  getApiVersion() {
    return "0.2";
  }

  getConfigSchema() {
    return {
      name: "Game of Life",
      description: "Клеточный автомат Конвея. Поддерживает множество начальных паттернов.",
      apiVersion: "0.2",
      params: {
        density: {
          type: "number",
          default: 0.3,
          label: "Плотность (для рандома)",
          description: "Доля живых клеток при случайной инициализации",
          ui: "scroller",
          min: 0.05,
          max: 0.95,
          step: 0.05,
        },
        wrapEdges: {
          type: "boolean",
          default: true,
          label: "Замкнутые края (тор)",
          description: "Противоположные стороны соединены",
          ui: "checkbox",
        },
      },
      actions: {
        // ── Инициализация ──
        randomize:    { label: "🎲 Случайное заполнение" },
        clear:        { label: "🗑 Очистить всё" },

        // ── Осцилляторы ──
        blinker:      { label: "── Мигалка (Blinker)" },
        pulsar:       { label: "💫 Пульсар (Pulsar)" },
        pentadeca:    { label: "🔟 Пентадекатлон" },

        // ── Космические корабли ──
        glider:       { label: "✈ Глайдер" },
        lwss:         { label: "🚀 Лёгкий корабль (LWSS)" },
        mwss:         { label: "🛸 Средний корабль (MWSS)" },

        // ── Паттерны роста ──
        rPentomino:   { label: "🧬 R-пентамино" },
        acorn:        { label: "🌰 Жёлудь (Acorn)" },
        diehard:      { label: "💀 Diehard" },

        // ── Статичные (Still lifes) ──
        block:        { label: "⬜ Блок" },
        beehive:      { label: "🐝 Улей (Beehive)" },
        loaf:         { label: "🍞 Буханка (Loaf)" },

        // ── Генераторы ──
        gosperGun:    { label: "🔫 Ружьё Госпера (Gosper Gun)" },

        // ── Массовые инициализации ──
        manyGliders:  { label: "✈✈✈ Много глайдеров" },
        symmetry4:    { label: "✦ 4-кратная симметрия" },
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
    this.runtime = ctx.runtime;
    this.width = ctx.gridWidth;
    this.height = ctx.gridHeight;
    this.grid = new Uint8Array(this.width * this.height);
    this.next = new Uint8Array(this.width * this.height);
    this.randomize();
  }

  iterate(_ctx) {
    const w = this.width;
    const h = this.height;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const neighbors = this.countNeighbors(x, y);
        const idx = y * w + x;
        const alive = this.grid[idx] === 1;
        this.next[idx] =
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
      // Базовые
      case "randomize":    this.randomize(); break;
      case "clear":        this.grid.fill(0); break;

      // Осцилляторы
      case "blinker":      this.clearAndPlace(this.patternBlinker()); break;
      case "pulsar":       this.clearAndPlace(this.patternPulsar()); break;
      case "pentadeca":    this.clearAndPlace(this.patternPentadecathlon()); break;

      // Корабли
      case "glider":       this.clearAndPlace(this.patternGlider()); break;
      case "lwss":         this.clearAndPlace(this.patternLWSS()); break;
      case "mwss":         
      {
        this.clearAndPlace(this.patternMWSS());
        this.runtime?.requestRenderIntervalChange(1)     
        break;   
      }

      // Паттерны роста
      case "rPentomino":   this.clearAndPlace(this.patternRPentomino()); break;
      case "acorn":        this.clearAndPlace(this.patternAcorn()); break;
      case "diehard":      this.clearAndPlace(this.patternDiehard()); break;

      // Статичные
      case "block":        this.clearAndPlace(this.patternBlock()); break;
      case "beehive":      this.clearAndPlace(this.patternBeehive()); break;
      case "loaf":         this.clearAndPlace(this.patternLoaf()); break;

      // Генераторы
      case "gosperGun":    this.clearAndPlace(this.patternGosperGun()); break;

      // Массовые
      case "manyGliders":  this.placeManyGliders(); break;
      case "symmetry4":    this.placeSymmetry4(); break;
    }
  }

  destroy() {
    this.grid = new Uint8Array(0);
    this.next = new Uint8Array(0);
  }

  // ═══════════════════════════════════════════════════════════════
  // Внутренние методы
  // ═══════════════════════════════════════════════════════════════

  randomize() {
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = Math.random() < this.config.density ? 1 : 0;
    }
  }

  countNeighbors(x, y) {
    let count = 0;
    const w = this.width;
    const h = this.height;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        let nx = x + dx;
        let ny = y + dy;
        if (this.config.wrapEdges) {
          nx = (nx + w) % w;
          ny = (ny + h) % h;
        } else if (nx < 0 || nx >= w || ny < 0 || ny >= h) {
          continue;
        }
        count += this.grid[ny * w + nx];
      }
    }
    return count;
  }

  // ─── Размещение паттерна по центру ───

  clearAndPlace(pattern) {
    this.grid.fill(0);
    const cx = Math.floor(this.width / 2);
    const cy = Math.floor(this.height / 2);
    for (const [dy, dx] of pattern) {
      const x = ((cx + dx) % this.width + this.width) % this.width;
      const y = ((cy + dy) % this.height + this.height) % this.height;
      this.grid[y * this.width + x] = 1;
    }
  }

  // ─── Паттерны (относительные координаты [dy, dx] от центра) ───

  patternGlider() {
    return [[0,1],[1,2],[2,0],[2,1],[2,2]];
  }

  patternBlinker() {
    return [[0,-1],[0,0],[0,1]];
  }

  patternBlock() {
    return [[0,0],[0,1],[1,0],[1,1]];
  }

  patternBeehive() {
    return [[-1,0],[-1,1],[0,-1],[0,2],[1,0],[1,1]];
  }

  patternLoaf() {
    return [[-1,0],[-1,1],[0,-1],[0,2],[1,0],[1,2],[2,1]];
  }

  patternLWSS() {
    return [
      [0,1],[0,4],
      [1,0],
      [2,0],[2,4],
      [3,0],[3,1],[3,2],[3,3],
    ];
  }

  patternMWSS() {
    return [
      [0,2],
      [1,0],[1,4],
      [2,5],
      [3,0],[3,5],
      [4,1],[4,2],[4,3],[4,4],[4,5],
    ];
  }

  patternRPentomino() {
    return [[-1,0],[-1,1],[0,-1],[0,0],[1,0]];
  }

  patternAcorn() {
    return [[0,-3],[0,-2],[0,0],[0,1],[0,2],[1,-1],[-1,0]];
    // Более точный Acorn:
    // return [[-1,1],[0,3],[1,0],[1,1],[1,3],[1,4],[1,5]];
  }

  patternDiehard() {
    return [[0,3],[1,-3],[1,-2],[2,-2],[2,2],[2,3],[2,4]];
  }

  patternPulsar() {
    const quarter = [
      [1,2],[1,3],[1,4],
      [2,1],[3,1],[4,1],
      [2,6],[3,6],[4,6],
      [6,2],[6,3],[6,4],
    ];
    const full = [];
    for (const [y, x] of quarter) {
      full.push([y, x]);
      full.push([y, -x]);
      full.push([-y, x]);
      full.push([-y, -x]);
    }
    return full;
  }

  patternPentadecathlon() {
    return [
      [0,-4],[0,-3],[0,-2],[0,-1],[0,0],[0,1],[0,2],[0,3],
      [-1,-3],[-1,2],[1,-3],[1,2],
    ];
  }

  patternGosperGun() {
    const ox = -18;
    const oy = -5;
    const cells = [
      [4,0],[4,1],[5,0],[5,1],
      [4,10],[5,10],[6,10],[3,11],[7,11],[2,12],[8,12],[2,13],[8,13],
      [5,14],[3,15],[7,15],[4,16],[5,16],[6,16],[5,17],
      [2,20],[3,20],[4,20],[2,21],[3,21],[4,21],[1,22],[5,22],
      [0,24],[1,24],[5,24],[6,24],
      [2,34],[3,34],[2,35],[3,35],
    ];
    return cells.map(([y, x]) => [y + oy, x + ox]);
  }

  // ─── Массовые инициализации ───

  placeManyGliders() {
    this.grid.fill(0);
    const glider = this.patternGlider();
    const spacing = 8;
    const cols = Math.floor(this.width / spacing);
    const rows = Math.floor(this.height / spacing);

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        if (Math.random() > 0.4) continue;
        const ox = gx * spacing + 2;
        const oy = gy * spacing + 2;
        for (const [dy, dx] of glider) {
          const x = (ox + dx) % this.width;
          const y = (oy + dy) % this.height;
          this.grid[y * this.width + x] = 1;
        }
      }
    }
  }

  placeSymmetry4() {
    this.grid.fill(0);
    const rPent = this.patternRPentomino();
    const qw = Math.floor(this.width / 4);
    const qh = Math.floor(this.height / 4);

    const centers = [
      [qh, qw],
      [qh, qw * 3],
      [qh * 3, qw],
      [qh * 3, qw * 3],
    ];

    for (const [cy, cx] of centers) {
      for (const [dy, dx] of rPent) {
        const x = ((cx + dx) % this.width + this.width) % this.width;
        const y = ((cy + dy) % this.height + this.height) % this.height;
        this.grid[y * this.width + x] = 1;
      }
    }
  }
}