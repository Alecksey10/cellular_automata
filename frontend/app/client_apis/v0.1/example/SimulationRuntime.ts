import type {
    SimulationConfig,
    SimulationProgram,
    RenderData,
} from "~/../client_apis/v0.1";

export interface RuntimeConfig {
    stepsPerRender: number;
}

export interface SimulationRuntimeOptions {
    program: SimulationProgram;
    config?: SimulationConfig;
    runtime?: Partial<RuntimeConfig>;
    onRender?: (data: RenderData) => void;
    onIterate?: (iteration:number) => void;
}

export class SimulationRuntime {
    private readonly program: SimulationProgram;

    private config: SimulationConfig;

    private readonly runtimeConfig: RuntimeConfig;

    private readonly onRender?: (data: RenderData) => void;
    private readonly onIterate?: (iteration:number) => void;    

    private iteration = 0;
    private elapsedTime = 0;

    private lastTime = 0;

    private running = false;
    private timer: number | null = null;

    constructor(options: SimulationRuntimeOptions) {
        this.program = options.program;

        this.config = {
            ...this.program.getDefaultConfig(),
            ...options.config,
        };

        this.runtimeConfig = {
            stepsPerRender: 1000,
            ...options.runtime,
        };

        this.onRender = options.onRender;
        this.onIterate = options.onIterate;

        this.init();
    }

    getProgram(): SimulationProgram {
        return this.program;
    }

    getConfig(): SimulationConfig {
        return {
            ...this.config,
        };
    }

    getIteration(): number {
        return this.iteration;
    }

    getElapsedTime(): number {
        return this.elapsedTime;
    }

    init(config?: SimulationConfig): void {
        this.pause();

        if (config) {
            this.config = {
                ...this.config,
                ...config,
            };
        }

        this.iteration = 0;
        this.elapsedTime = 0;
        this.lastTime = performance.now();

        this.program.init({
            config: this.config,
        });

        this.render();
    }

    start(): void {
        if (this.running) {
            return;
        }

        this.running = true;

        this.program.resume({
            iteration: this.iteration,
            elapsedTime: this.elapsedTime,
        });

        this.lastTime = performance.now();

        this.schedule();
    }

    pause(): void {
        if (!this.running) {
            return;
        }

        this.running = false;

        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.program.pause({
            iteration: this.iteration,
            elapsedTime: this.elapsedTime,
        });
    }

    step(): void {
        const now = performance.now();

        const deltaTime = now - this.lastTime;

        this.lastTime = now;
        this.elapsedTime += deltaTime;

        this.iteration++;

        this.program.step({
            iteration: this.iteration,
            deltaTime,
            elapsedTime: this.elapsedTime,
        });

        this.render();
        this.onIterate?.(this.iteration);
    }

    configure(config: SimulationConfig): void {
        this.config = {
            ...this.config,
            ...config,
        };

        this.program.configure(config, {
            iteration: this.iteration,
            elapsedTime: this.elapsedTime,
        });

        this.render();
    }

    render(): RenderData {
        const data = this.program.render();

        this.onRender?.(data);

        return data;
    }

    dispose(): void {
        this.pause();
        this.program.dispose();
    }

    private schedule(): void {
        this.timer = window.setTimeout(
            () => this.tick(),
            16,
        );
    }

    private tick(): void {
        if (!this.running) {
            return;
        }

        const now = performance.now();
        const deltaTime = now - this.lastTime;

        this.lastTime = now;
        this.elapsedTime += deltaTime;

        for (
            let i = 0;
            i < this.runtimeConfig.stepsPerRender;
            i++
        ) {
            this.iteration++;

            this.program.step({
                iteration: this.iteration,
                deltaTime,
                elapsedTime: this.elapsedTime,
            });
        }

        this.render();
        this.onIterate?.(this.iteration);
        this.schedule();
    }
}