// import type { SimulationConfig } from "./config";

// export interface InitContext {
//     config: SimulationConfig;
// }

// export interface StepContext {
//     iteration: number;

//     /**
//      * Время с предыдущей итерации, миллисекунды.
//      */
//     deltaTime: number;

//     /**
//      * Активное время с момента запуска.
//      * Время паузы сюда не входит.
//      */
//     elapsedTime: number;
// }

// export interface PauseContext {
//     iteration: number;
//     elapsedTime: number;
// }

// export interface ResumeContext {
//     iteration: number;
//     elapsedTime: number;
// }

// export interface ConfigureContext {
//     iteration: number;
//     elapsedTime: number;
// }