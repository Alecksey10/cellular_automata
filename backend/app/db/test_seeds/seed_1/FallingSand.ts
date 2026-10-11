import type {
    SimulationProgram,
    SimulationConfig,
    ConfigSchema,
    RenderData,
    InitContext,
    StepContext,
    PauseContext,
    ResumeContext,
    ConfigureContext,
} from "~/../client_apis/v0.1";


export default class FallingSand implements SimulationProgram {
    private width = 0;
    private height = 0;

    private cells!: Uint8Array;
    private buffer!: Uint8Array;

    private iteration = 0;

    private config!: SimulationConfig;

    // Типы частиц:
    // 0 = пусто
    // 1 = песок
    // 2 = стена (неподвижная)

    init(context: InitContext): void {
        this.config = {
            ...this.getDefaultConfig(),
            ...context.config,
        };

        this.width =
            this.config.width as number;

        this.height =
            this.config.height as number;

        const size =
            this.width * this.height;

        this.cells =
            new Uint8Array(size);

        this.buffer =
            new Uint8Array(size);

        this.iteration = 0;

        // Создаём начальный «источник» —
        // стену-платформу посередине
        const platformY =
            (this.height * 0.3) | 0;

        const platformHalfWidth =
            (this.width * 0.15) | 0;

        const cx =
            (this.width / 2) | 0;

        for (
            let x = cx - platformHalfWidth;
            x <= cx + platformHalfWidth;
            x++
        ) {
            if (x >= 0 && x < this.width) {
                this.cells[
                    platformY * this.width + x
                ] = 2;
            }
        }
    }


    step(context: StepContext): void {
        const w = this.width;
        const h = this.height;

        // Копируем текущее состояние в буфер
        this.buffer.set(this.cells);

        // Генерируем песок сверху
        // (из нескольких точек-источников)
        const spawnRate =
            this.config.spawnRate as number;

        const sourceCount =
            this.config.sourceCount as number;

        for (let s = 0; s < sourceCount; s++) {
            const sx =
                ((w / (sourceCount + 1)) *
                    (s + 1)) |
                0;

            if (
                Math.random() < spawnRate &&
                this.buffer[sx] === 0
            ) {
                this.buffer[sx] = 1;
            }
        }

        // Обходим снизу вверх,
        // чтобы песок корректно падал
        for (let y = h - 2; y >= 0; y--) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;

                if (this.buffer[idx] !== 1) {
                    continue;
                }

                const below =
                    (y + 1) * w + x;

                const belowLeft =
                    (y + 1) * w + (x - 1);

                const belowRight =
                    (y + 1) * w + (x + 1);

                // Падение вниз
                if (
                    this.buffer[below] === 0
                ) {
                    this.buffer[below] = 1;
                    this.buffer[idx] = 0;
                }
                // Падение вниз-влево
                else if (
                    x > 0 &&
                    this.buffer[belowLeft] ===
                        0
                ) {
                    this.buffer[belowLeft] = 1;
                    this.buffer[idx] = 0;
                }
                // Падение вниз-вправо
                else if (
                    x < w - 1 &&
                    this.buffer[belowRight] ===
                        0
                ) {
                    this.buffer[belowRight] = 1;
                    this.buffer[idx] = 0;
                }
                // Рандомизация при обоих
                // вариантах
                else if (
                    x > 0 &&
                    x < w - 1 &&
                    this.buffer[belowLeft] ===
                        0 &&
                    this.buffer[belowRight] ===
                        0
                ) {
                    if (
                        Math.random() < 0.5
                    ) {
                        this.buffer[
                            belowLeft
                        ] = 1;
                    } else {
                        this.buffer[
                            belowRight
                        ] = 1;
                    }
                    this.buffer[idx] = 0;
                }
            }
        }

        // Свапаем буферы
        const tmp = this.cells;
        this.cells = this.buffer;
        this.buffer = tmp;

        this.iteration =
            context.iteration;
    }


    pause(_context: PauseContext): void {}

    resume(_context: ResumeContext): void {}


    render(): RenderData {
        return {
            type: "grid",
            width: this.width,
            height: this.height,
            iteration: this.iteration,
            data: this.cells,
        };
    }


    getDefaultConfig(): SimulationConfig {
        return {
            width: 100,
            height: 100,
            spawnRate: 0.3,
            sourceCount: 3,
        };
    }


    getConfigSchema(): ConfigSchema {
        return {
            fields: [
                {
                    key: "width",
                    type: "integer",
                    defaultValue: 200,
                    min: 50,
                    max: 500,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "height",
                    type: "integer",
                    defaultValue: 150,
                    min: 50,
                    max: 500,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "spawnRate",
                    type: "float",
                    defaultValue: 0.3,
                    min: 0.01,
                    max: 1.0,
                    step: 0.05,
                    hotReload: true,
                },
                {
                    key: "sourceCount",
                    type: "integer",
                    defaultValue: 3,
                    min: 1,
                    max: 10,
                    step: 1,
                    hotReload: true,
                },
            ],
        };
    }


    configure(
        config: SimulationConfig,
        _context: ConfigureContext,
    ): void {
        Object.assign(
            this.config,
            config,
        );
    }

    getIteration(): number {
        return this.iteration;
    }

    dispose(): void {}
}