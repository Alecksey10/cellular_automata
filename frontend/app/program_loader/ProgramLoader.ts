import type {
    SimulationProgram,
} from "~/../client_apis/v0.1";

import {
    compileTypeScript,
} from "./compiler";


export type ProgramLanguage =
    | "javascript"
    | "typescript";

export async function loadProgram(
    source: string,
    language: ProgramLanguage,
): Promise<any> { // возвращаем any, так как версии API разные

    const javascript =
        language === "typescript"
            ? compileTypeScript(source)
            : source;

    const blob =
        new Blob(
            [javascript],
            {
                type: "text/javascript",
            },
        );

    const url =
        URL.createObjectURL(blob);

    try {
        const module =
            await import(
                /* @vite-ignore */
                url
            );

        const Program =
            module.default;

        if (typeof Program !== "function") {
            throw new Error(
                "Program must have a default export (Class)",
            );
        }

        // Создаем инстанс класса
        const program = new Program();

        // Валидируем в зависимости от версии API
        validateProgram(program);

        return program;

    } finally {
        URL.revokeObjectURL(url);
    }
}

function validateProgram(program: any): void {
    // Проверяем, поддерживает ли автомат v0.2
    const isV02 = 
        typeof program.getApiVersion === "function" && 
        program.getApiVersion() === "0.2";

    // Набор методов для проверки
    const requiredMethods = isV02
        ? [
            "getApiVersion",
            "getConfigSchema",
            "getConfig",
            "setConfig",
            "init",
            "iterate",
            "render",
            "runAction",
            "destroy",
          ]
        : [
            "init",
            "step",
            "pause",
            "resume",
            "render",
            "getDefaultConfig",
            "getConfigSchema",
            "configure",
            "dispose",
          ];

    for (const method of requiredMethods) {
        if (typeof program[method] !== "function") {
            throw new Error(
                `Simulation does not implement "${method}()" для API ${isV02 ? "v0.2" : "v0.1"}`,
            );
        }
    }
}