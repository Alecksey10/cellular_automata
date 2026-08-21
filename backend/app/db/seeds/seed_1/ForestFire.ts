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


export default class ForestFire implements SimulationProgram {
    private width = 0;
    private height = 0;

    private cells!: Uint8Array;
    private next!: Uint8Array;

    private config!: SimulationConfig;

    private iteration = 0;

    private readonly EMPTY = 0;
    private readonly TREE = 1;
    private readonly FIRE = 2;


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

        this.next =
            new Uint8Array(size);

        this.iteration = 0;

        const density =
            this.config.density as number;

        for (let i = 0; i < size; i++) {
            if (Math.random() < density) {
                this.cells[i] = this.TREE;
            }
        }
    }


    step(context: StepContext): void {
        const width = this.width;
        const height = this.height;

        const fireProbability =
            this.config.fireProbability as number;

        const regrowthProbability =
            this.config.regrowthProbability as number;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const index =
                    y * width + x;

                const state =
                    this.cells[index];


                // Огонь сгорает
                if (state === this.FIRE) {
                    this.next[index] = this.EMPTY;
                    continue;
                }


                // Пустая клетка может зарасти
                if (state === this.EMPTY) {
                    this.next[index] =
                        Math.random() < regrowthProbability
                            ? this.TREE
                            : this.EMPTY;

                    continue;
                }


                // Здесь state === TREE

                // Случайное возгорание
                if (Math.random() < fireProbability) {
                    this.next[index] = this.FIRE;
                    continue;
                }


                // Проверяем соседний огонь
                let burning = false;

                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {

                        if (dx === 0 && dy === 0) {
                            continue;
                        }

                        const nx = x + dx;
                        const ny = y + dy;

                        if (
                            nx < 0 ||
                            nx >= width ||
                            ny < 0 ||
                            ny >= height
                        ) {
                            continue;
                        }

                        if (
                            this.cells[
                            ny * width + nx
                            ] === this.FIRE
                        ) {
                            burning = true;
                            break;
                        }
                    }

                    if (burning) {
                        break;
                    }
                }


                this.next[index] =
                    burning
                        ? this.FIRE
                        : this.TREE;
            }
        }


        [
            this.cells,
            this.next,
        ] = [
                this.next,
                this.cells,
            ];

        this.iteration =
            context.iteration;
    }


    pause(_context: PauseContext): void {
    }

    resume(_context: ResumeContext): void {
    }


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
            density: 0.65,
            regrowthProbability: 0.001,
            fireProbability: 0.00001,
        };
    }


    getConfigSchema(): ConfigSchema {
        return {
            fields: [
                {
                    key: "width",
                    type: "integer",
                    defaultValue: 1000,
                    min: 10,
                    max: 10000,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "height",
                    type: "integer",
                    defaultValue: 75,
                    min: 10,
                    max: 1000,
                    step: 10,
                    hotReload: false,
                },
                {
                    key: "density",
                    type: "number",
                    defaultValue: 0.65,
                    min: 0,
                    max: 1,
                    step: 0.01,
                    hotReload: true,
                },
                {
                    key: "regrowthProbability",
                    type: "number",
                    defaultValue: 0,
                    min: 0,
                    max: 1,
                    step: 0.001,
                    hotReload: true,
                },
                {
                    key: "fireProbability",
                    type: "number",
                    defaultValue: 0.001,
                    min: 0,
                    max: 1,
                    step: 0.001,
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


    dispose(): void {
    }
}