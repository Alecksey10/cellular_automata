/**
 * Runtime симуляции.
 *
 * Runtime -> Program:
 *   init(scene)
 *   step()
 *
 * Program -> Runtime:
 *   api.render(frame)
 */

export class SimulationRuntime {
    constructor(program, options = {}) {
        this.program = program;

        this.fps = options.fps ?? 30;

        this.stepsPerFrame =
            options.stepsPerFrame ?? 1;

        this.running = false;
        this.initialized = false;

        this.timer = null;

        this.onRender = null;

        /*
         * Пока true — render разрешён.
         */
        this.renderEnabled = true;
    }

    init(scene) {
        this.pause();

        this.program.init(scene);

        this.initialized = true;
    }

    start() {
        if (!this.initialized) {
            throw new Error(
                "Simulation is not initialized"
            );
        }

        if (this.running) {
            return;
        }

        this.running = true;

        this.scheduleFrame();
    }

    pause() {
        this.running = false;

        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    step() {
        if (!this.initialized) {
            throw new Error(
                "Simulation is not initialized"
            );
        }

        this.program.step();
    }

    stepMany(count) {
        /*
         * Сохраняем состояние render.
         */
        const previous =
            this.renderEnabled;

        /*
         * Подавляем промежуточные кадры.
         */
        this.renderEnabled = false;

        for (let i = 0; i < count; i++) {
            this.program.step();
        }

        /*
         * Возвращаем render.
         */
        this.renderEnabled = previous;

        /*
         * Просим программу отдать
         * текущее состояние.
         *
         * Но это уже зависит от того,
         * есть ли у неё emitFrame().
         */
        this.program.emitFrame?.();
    }

    render(frame) {
        if (!this.renderEnabled) {
            return;
        }

        this.onRender?.(frame);
    }

    scheduleFrame() {
        if (!this.running) {
            return;
        }

        const delay =
            1000 / this.fps;

        this.timer = setTimeout(() => {
            this.timer = null;

            if (!this.running) {
                return;
            }

            this.stepMany(
                this.stepsPerFrame
            );

            this.scheduleFrame();

        }, delay);
    }
}


export function createSimulationAPI(runtime) {
    return Object.freeze({
        render(data) {
            runtime.render(data);
        }
    });
}
