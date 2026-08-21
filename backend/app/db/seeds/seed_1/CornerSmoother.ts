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


export default class CornerSmoother implements SimulationProgram {
    private width = 0;
    private height = 0;

    private cells!: Uint8Array;
    private buffer!: Uint8Array;

    // Префиксная сумма для
    // быстрого подсчёта
    private prefixSum!: Int32Array;

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

        this.prefixSum =
            new Int32Array(
                (this.width + 1) *
                    (this.height + 1),
            );

        const pattern =
            this.config.pattern as string;

        this.generateInitial(pattern);

        this.iteration = 0;
    }


    private generateInitial(
        pattern: string,
    ): void {
        const w = this.width;
        const h = this.height;
        const size = w * h;

        switch (pattern) {
            case "noise": {
                const ratio =
                    this.config
                        .fillRatio as number;

                for (
                    let i = 0;
                    i < size;
                    i++
                ) {
                    this.cells[i] =
                        Math.random() < ratio
                            ? 1
                            : 0;
                }
                break;
            }

            case "blocks": {
                // Шахматный паттерн
                // из крупных блоков
                const blockSize = 8;
                for (
                    let y = 0;
                    y < h;
                    y++
                ) {
                    for (
                        let x = 0;
                        x < w;
                        x++
                    ) {
                        const bx =
                            (x / blockSize) |
                            0;
                        const by =
                            (y / blockSize) |
                            0;

                        this.cells[
                            y * w + x
                        ] =
                            (bx + by) % 2 ===
                            0
                                ? 1
                                : 0;
                    }
                }

                // Добавляем немного шума
                for (
                    let i = 0;
                    i < size;
                    i++
                ) {
                    if (
                        Math.random() < 0.1
                    ) {
                        this.cells[i] ^= 1;
                    }
                }
                break;
            }

            case "diamond": {
                const cx = (w / 2) | 0;
                const cy = (h / 2) | 0;
                const r =
                    Math.min(cx, cy) * 0.7;

                for (
                    let y = 0;
                    y < h;
                    y++
                ) {
                    for (
                        let x = 0;
                        x < w;
                        x++
                    ) {
                        const dist =
                            Math.abs(
                                x - cx,
                            ) +
                            Math.abs(y - cy);

                        this.cells[
                            y * w + x
                        ] =
                            dist < r ? 1 : 0;
                    }
                }

                // Зашумляем границу
                for (
                    let y = 0;
                    y < h;
                    y++
                ) {
                    for (
                        let x = 0;
                        x < w;
                        x++
                    ) {
                        const dist =
                            Math.abs(
                                x - cx,
                            ) +
                            Math.abs(y - cy);

                        if (
                            Math.abs(
                                dist - r,
                            ) < r * 0.3
                        ) {
                            if (
                                Math.random() <
                                0.4
                            ) {
                                this.cells[
                                    y * w + x
                                ] ^= 1;
                            }
                        }
                    }
                }
                break;
            }

            default: {
                for (
                    let i = 0;
                    i < size;
                    i++
                ) {
                    this.cells[i] =
                        Math.random() < 0.5
                            ? 1
                            : 0;
                }
            }
        }
    }


    private buildPrefixSum(): void {
        const w = this.width;
        const h = this.height;
        const pw = w + 1;

        // Обнуляем первую строку
        // и первый столбец
        for (
            let x = 0;
            x <= w;
            x++
        ) {
            this.prefixSum[x] = 0;
        }

        for (
            let y = 0;
            y <= h;
            y++
        ) {
            this.prefixSum[y * pw] = 0;
        }

        for (
            let y = 1;
            y <= h;
            y++
        ) {
            for (
                let x = 1;
                x <= w;
                x++
            ) {
                this.prefixSum[
                    y * pw + x
                ] =
                    this.cells[
                        (y - 1) * w +
                            (x - 1)
                    ] +
                    this.prefixSum[
                        (y - 1) * pw + x
                    ] +
                    this.prefixSum[
                        y * pw + (x - 1)
                    ] -
                    this.prefixSum[
                        (y - 1) * pw +
                            (x - 1)
                    ];
            }
        }
    }


    private querySum(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
    ): number {
        const pw = this.width + 1;

        // Координаты в префиксной
        // сумме сдвинуты на 1
        const ax = x1;
        const ay = y1;
        const bx = x2 + 1;
        const by = y2 + 1;

        return (
            this.prefixSum[by * pw + bx] -
            this.prefixSum[ay * pw + bx] -
            this.prefixSum[by * pw + ax] +
            this.prefixSum[ay * pw + ax]
        );
    }


    step(context: StepContext): void {
        const w = this.width;
        const h = this.height;

        const radius =
            this.config
                .kernelRadius as number;

        const threshold =
            this.config.threshold as number;

        // Строим префиксную сумму
        // для быстрого подсчёта
        this.buildPrefixSum();

        for (let y = 0; y < h; y++) {
            for (
                let x = 0;
                x < w;
                x++
            ) {
                const x1 = Math.max(
                    0,
                    x - radius,
                );
                const y1 = Math.max(
                    0,
                    y - radius,
                );
                const x2 = Math.min(
                    w - 1,
                    x + radius,
                );
                const y2 = Math.min(
                    h - 1,
                    y + radius,
                );

                const area =
                    (x2 - x1 + 1) *
                    (y2 - y1 + 1);

                const sum =
                    this.querySum(
                        x1,
                        y1,
                        x2,
                        y2,
                    );

                const ratio = sum / area;

                this.buffer[y * w + x] =
                    ratio >= threshold
                        ? 1
                        : 0;
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
            width: 100,
            height: 100,
            kernelRadius: 3,
            threshold: 0.5,
            fillRatio: 0.5,
            pattern: "diamond",
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
                    key: "kernelRadius",
                    type: "integer",
                    defaultValue: 3,
                    min: 2,
                    max: 10,
                    step: 1,
                    hotReload: true,
                },
                {
                    key: "threshold",
                    type: "float",
                    defaultValue: 0.5,
                    min: 0.2,
                    max: 0.8,
                    step: 0.01,
                    hotReload: true,
                },
                {
                    key: "fillRatio",
                    type: "float",
                    defaultValue: 0.5,
                    min: 0.2,
                    max: 0.8,
                    step: 0.05,
                    hotReload: false,
                },
                {
                    key: "pattern",
                    type: "string",
                    defaultValue: "diamond",
                    hotReload: false,
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