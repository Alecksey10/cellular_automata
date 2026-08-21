import type {
    SimulationConfig,
    ConfigSchema
} from "./config";

import type {
    InitContext,
    StepContext,
    PauseContext,
    ResumeContext,
    ConfigureContext
} from "./context";

import type { RenderData } from "./render";

export interface SimulationProgram {

    /**
     * Инициализирует или полностью сбрасывает автомат.
     */
    init(context: InitContext): void;

    /**
     * Выполняет ровно одну итерацию автомата.
     */
    step(context: StepContext): void;

    /**
     * Уведомляет автомат о постановке на паузу.
     */
    pause(context: PauseContext): void;

    /**
     * Уведомляет автомат о возобновлении работы.
     */
    resume(context: ResumeContext): void;

    /**
     * Возвращает данные текущего состояния для визуализации.
     */
    render(): RenderData;

    /**
     * Возвращает конфигурацию автомата по умолчанию.
     */
    getDefaultConfig(): SimulationConfig;

    /**
     * Возвращает описание доступных параметров конфигурации.
     */
    getConfigSchema(): ConfigSchema;

    /**
     * Изменяет конфигурацию без полной инициализации,
     * если изменяемые параметры поддерживают hot reload.
     */
    configure(
        config: SimulationConfig,
        context: ConfigureContext
    ): void;

    /**
     * Освобождает ресурсы автомата.
     */
    dispose(): void;
    getIteration():number;
}