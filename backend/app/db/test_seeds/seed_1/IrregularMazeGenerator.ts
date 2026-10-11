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


export default class OrganicCave implements SimulationProgram {
    private width = 0;
    private height = 0;

    private cells!: Uint8Array;
    private buffer!: Uint8Array;

    private iteration = 0;

    private config!: SimulationConfig;


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

        const fillRatio =
            this.config.fillRatio as number;

        // Начальный случайный шум
        for (let i = 0; i < size; i++) {
            this.cells[i] =
                Math.random() < fillRatio
                    ? 1
                    : 0;
        }

        this.iteration = 0;
    }


    /**
     * Подсчёт живых соседей
     * в квадратном ядре radius×radius.
     *
     * Для ядра 5×5: radius = 2.
     * Для ядра 7×7: radius = 3.
     */
    private countInKernel(
        cx: number,
        cy: number,
        radius: number,
    ): number {
        let count = 0;
        const w = this.width;
        const h = this.height;

        for (
            let dy = -radius;
            dy <= radius;
            dy++
        ) {
            for (
                let dx = -radius;
                dx <= radius;
                dx++
            ) {
                if (
                    dx === 0 &&
                    dy === 0
                ) {
                    continue;
                }

                let nx = cx + dx;
                let ny = cy + dy;

                // За границей —
                // считаем стеной
                if (
                    nx < 0 ||
                    nx >= w ||
                    ny < 0 ||
                    ny >= h
                ) {
                    count++;
                    continue;
                }

                count +=
                    this.cells[ny * w + nx];
            }
        }

        return count;
    }


    step(context: StepContext): void {
        const w = this.width;
        const h = this.height;

        const radius =
            this.config.kernelRadius as number;

        const birthMin =
            this.config.birthMin as number;

        const birthMax =
            this.config.birthMax as number;

        const surviveMin =
            this.config.surviveMin as number;

        const surviveMax =
            this.config.surviveMax as number;

        // Максимум соседей в ядре
        // (для информации)
        // const kernelSize =
        //     (2 * radius + 1) ** 2 - 1;

        for (let y = 0; y < h; y++) {
            for (
                let x = 0;
                x < w;
                x++
            ) {
                const idx = y * w + x;

                const n =
                    this.countInKernel(
                        x,
                        y,
                        radius,
                    );

                const alive =
                    this.cells[idx] === 1;

                if (alive) {
                    this.buffer[idx] =
                        n >= surviveMin &&
                        n <= surviveMax
                            ? 1
                            : 0;
                } else {
                    this.buffer[idx] =
                        n >= birthMin &&
                        n <= birthMax
                            ? 1
                            : 0;
                }
            }
        }

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
            width: 200,
            height: 150,
            fillRatio: 0.48,
            kernelRadius: 2,
            // Ядро 5×5 → макс. 24 соседа
            birthMin: 13,
            birthMax: 24,
            surviveMin: 10,
            surviveMax: 24,
        };
    }


    getConfigSchema(): ConfigSchema {
        return {
            fields: [
                {
                    key: "width",
                    type: "integer",
                    defaultValue: 200,
                    min: 30,
                    max: 400,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "height",
                    type: "integer",
                    defaultValue: 150,
                    min: 30,
                    max: 400,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "fillRatio",
                    type: "float",
                    defaultValue: 0.48,
                    min: 0.3,
                    max: 0.7,
                    step: 0.01,
                    hotReload: false,
                },
                {
                    key: "kernelRadius",
                    type: "integer",
                    defaultValue: 2,
                    min: 1,
                    max: 5,
                    step: 1,
                    hotReload: false,
                },
                {
                    key: "birthMin",
                    type: "integer",
                    defaultValue: 13,
                    min: 1,
                    max: 48,
                    step: 1,
                    hotReload: true,
                },
                {
                    key: "birthMax",
                    type: "integer",
                    defaultValue: 24,
                    min: 1,
                    max: 48,
                    step: 1,
                    hotReload: true,
                },
                {
                    key: "surviveMin",
                    type: "integer",
                    defaultValue: 10,
                    min: 1,
                    max: 48,
                    step: 1,
                    hotReload: true,
                },
                {
                    key: "surviveMax",
                    type: "integer",
                    defaultValue: 24,
                    min: 1,
                    max: 48,
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