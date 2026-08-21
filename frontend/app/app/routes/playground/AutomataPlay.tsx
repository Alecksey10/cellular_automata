import { useParams } from "react-router";
import { Route } from "react-router";


import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    // ForestFire,
    LangtonsAnt,
} from "~/../client_apis/v0.1/example/index";

import {
    SimulationRuntime,
} from "~/../client_apis/v0.1/example/SimulationRuntime";

import type {
    RenderData,
} from "~/../client_apis/v0.1";
import { loadProgram } from "../../../program_loader/ProgramLoader";
import { APIMethodGetAutomataByID, type AutomataSourceRequest } from "../../../api/automata/APIMethodGetAutomataByID";
// import {programa} from "~/../client_apis/v0.1/example/ForestFire"
// const response =
//     await fetch("/api/simulation/forest-fire");

// const definition =
//     await response.json();

// const program =
//     await loadProgram(
    //         definition.source,
    //         "typescript",
    //     );
    
export async function loader() {
    return { message: "does not do anything" };
}


export default function Example() {
    const { automatonId } = useParams();

    const canvasRef =
        useRef<HTMLCanvasElement>(null);

    const forestRuntimeRef = useRef<SimulationRuntime | null>(null);

    const [forestIteration, setForestIteration] =
        useState(0);


    useEffect(() => {
        
        let runtime:SimulationRuntime|null = forestRuntimeRef.current;
        let ignore = false;
        async function start() {
            const method = new APIMethodGetAutomataByID()
            const response = await method.execute({automataID:automatonId} as AutomataSourceRequest);
                
            if (!response.ok) {
                console.log("Не удалось загрузить исходный код автомата");
                console.error(response.error)
                return;
            }


            const definition =
                await response.data!.source_code
            
            const program =
            await loadProgram(
                definition,
                "typescript",
            );
            if(!ignore)
            {
            forestRuntimeRef.current =
                new SimulationRuntime({
                    program,

                    runtime: {
                        stepsPerRender: 3,
                    },

                    onRender: (data) => {
                        const canvas =
                            canvasRef.current;

                        if (!canvas) {
                            return;
                        }

                        renderCanvas(
                            canvas,
                            data,
                        );
                    },
                    onIterate: (data:number)=>
                    {
                        setForestIteration(data)

                    }
                });
            runtime = forestRuntimeRef.current
            runtime.start();
            }
        }
        start();

        return () => {
            ignore = true;
            console.warn("disposing it")
            forestRuntimeRef.current?.dispose();
        };
    }, []);


        return (
        <main>
            <h1>
                Simulation API v0.1
            </h1>


            <section>
                <h2>
                    Forest Fire
                </h2>

                <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                />

                <div>
                    <button
                        onClick={() =>
                            forestRuntimeRef
                                .current
                                ?.start()
                        }
                    >
                        Start
                    </button>

                    <button
                        onClick={() =>
                            forestRuntimeRef
                                .current
                                ?.pause()
                        }
                    >
                        Pause
                    </button>

                    <button
                        onClick={() =>
                            forestRuntimeRef
                                .current
                                ?.step()
                        }
                    >
                        Step
                    </button>

                    <button
                        onClick={() =>
                            forestRuntimeRef
                                .current
                                ?.init()
                        }
                    >
                        Reset
                    </button>
                </div>

                <div>
                    Iteration: {forestIteration}
                </div>
            </section>
        </main>
    );
}

/* =========================================================
 * Renderer
 * ======================================================= */

function renderCanvas(
    canvas: HTMLCanvasElement,
    frame: RenderData,
): void {
    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    const scaleX =
        canvas.width / frame.width;

    const scaleY =
        canvas.height / frame.height;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
    );

    if (frame.type !== "grid") {
        return;
    }

    const cells =
        frame.data as Uint8Array;

    for (
        let y = 0;
        y < frame.height;
        y++
    ) {
        for (
            let x = 0;
            x < frame.width;
            x++
        ) {
            const value =
                cells[
                    y * frame.width + x
                ];

            if (value === 0) {
                ctx.fillStyle = "#101820";
            } else if (value === 1) {
                ctx.fillStyle = "#26733a";
            } else {
                ctx.fillStyle = "#ff5a24";
            }

            ctx.fillRect(
                x * scaleX,
                y * scaleY,
                scaleX + 1,
                scaleY + 1,
            );
        }
    }
}
function renderGrid(
    ctx: CanvasRenderingContext2D,
    frame: RenderData,
    scaleX: number,
    scaleY: number,
): void {
    const cells =
        frame.data as Uint8Array;

    for (let y = 0; y < frame.height; y++) {
        for (let x = 0; x < frame.width; x++) {

            const value =
                cells[y * frame.width + x];

            if (value === 0) {
                ctx.fillStyle = "#101820";
            } else if (value === 1) {
                ctx.fillStyle = "#26733a";
            } else {
                ctx.fillStyle = "#ff5a24";
            }

            ctx.fillRect(
                x * scaleX,
                y * scaleY,
                scaleX + 1,
                scaleY + 1,
            );
        }
    }
}


function renderAnt(
    ctx: CanvasRenderingContext2D,
    frame: RenderData,
    scaleX: number,
    scaleY: number,
): void {
    const data =
        frame.data as {
            cells: Uint8Array;

            ant: {
                x: number;
                y: number;
                direction: number;
            };
        };


    for (
        let y = 0;
        y < frame.height;
        y++
    ) {
        for (
            let x = 0;
            x < frame.width;
            x++
        ) {
            const value =
                data.cells[
                    y * frame.width + x
                ];

            ctx.fillStyle =
                value === 0
                    ? "#eeeeee"
                    : "#222222";

            ctx.fillRect(
                x * scaleX,
                y * scaleY,
                scaleX + 1,
                scaleY + 1,
            );
        }
    }


    /*
     * Муравей.
     */
    ctx.fillStyle = "#e33";

    ctx.fillRect(
        data.ant.x * scaleX,
        data.ant.y * scaleY,
        Math.max(2, scaleX),
        Math.max(2, scaleY),
    );
}