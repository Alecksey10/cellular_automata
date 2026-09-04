// import { useParams } from "react-router";

// import {
//     useContext,
//     useEffect,
//     useRef,
//     useState,
// } from "react";

// import {
//     // ForestFire,
//     LangtonsAnt,
// } from "~/../client_apis/v0.1/example/index";

// import {
//     SimulationRuntime,
// } from "~/../client_apis/v0.1/example/SimulationRuntime";

// import type {
//     RenderData,
// } from "~/../client_apis/v0.1";
// import { loadProgram } from "../../../program_loader/ProgramLoader";
// import { APIMethodGetAutomataSourceByID, type AutomataRequest, type AutomataSourceRequest } from "../../../api/automata/APIMethodGetAutomataByID";

// import { AuthContext } from "~/root";
// import type { AuthenticationState } from "~/states/auth";
// import type { Route } from "./+types/AutomataPlay";
// import { automataAPI } from "../../../api/automata";

// export async function clientLoader({
//   params,
// }: Route.ClientLoaderArgs) {
//     const { automatonId } = useParams();
//     const res = await automataAPI.getAutomata.execute({automataID:automatonId} as AutomataRequest)
    
//     return res.data!;
// }


// export default function Example() {
//     const { automatonId } = useParams();

//     const authed:AuthenticationState|null = useContext(AuthContext)

//     const canvasRef =
//         useRef<HTMLCanvasElement>(null);

//     const runtimeRef = useRef<SimulationRuntime | null>(null);

//     const [runtimeIteration, setRuntimeIteration] =
//         useState(0);


//     useEffect(() => {

//         let runtime:SimulationRuntime|null = runtimeRef.current;
//         let ignore = false;
//         async function start() {
//             const method = new APIMethodGetAutomataSourceByID()
//             const response = await method.execute({automataID:automatonId} as AutomataSourceRequest);
                
//             if (!response.ok) {
//                 console.log("Не удалось загрузить исходный код автомата");
//                 console.error(response.error)
//                 return;
//             }


//             const definition =
//                 await response.data!.source_code
            
//             const program =
//             await loadProgram(
//                 definition,
//                 "typescript",
//             );
//             if(!ignore)
//             {
//             runtimeRef.current =
//                 new SimulationRuntime({
//                     program,

//                     runtime: {
//                         stepsPerRender: 1,
//                     },

//                     onRender: (data) => {
//                         const canvas =
//                             canvasRef.current;

//                         if (!canvas) {
//                             return;
//                         }

//                         renderCanvas(
//                             canvas,
//                             data,
//                         );
//                     },
//                     onIterate: (data:number)=>
//                     {
//                         setRuntimeIteration(data)

//                     }
//                 });
//             runtime = runtimeRef.current
//             runtime.start();
//             }
//         }
//         start();

//         return () => {
//             ignore = true;
//             console.warn("disposing it")
//             runtimeRef.current?.dispose();
//         };
//     }, []);


//         return (
//         <main>
//             <h1>
//                 Simulation API v0.1
//             </h1>


//             <section>
//                 <h2>
//                     Forest Fire
//                 </h2>

//                 <canvas
//                     ref={canvasRef}
//                     width={600}
//                     height={600}
//                 />

//                 <div>
//                     <button
//                         onClick={() =>
//                             runtimeRef
//                                 .current
//                                 ?.start()
//                         }
//                     >
//                         Start
//                     </button>

//                     <button
//                         onClick={() =>
//                             runtimeRef
//                                 .current
//                                 ?.pause()
//                         }
//                     >
//                         Pause
//                     </button>

//                     <button
//                         onClick={() =>
//                             runtimeRef
//                                 .current
//                                 ?.step()
//                         }
//                     >
//                         Step
//                     </button>

//                     <button
//                         onClick={() =>
//                             runtimeRef
//                                 .current
//                                 ?.init()
//                         }
//                     >
//                         Reset
//                     </button>
//                 </div>

//                 <div>
//                     Iteration: {runtimeIteration}
//                 </div>
//             </section>
//         </main>

//     );
// }

// /* =========================================================
//  * Renderer
//  * ======================================================= */

// function renderCanvas(
//     canvas: HTMLCanvasElement,
//     frame: RenderData,
// ): void {
//     const ctx =
//         canvas.getContext("2d");

//     if (!ctx) {
//         return;
//     }

//     const scaleX =
//         canvas.width / frame.width;

//     const scaleY =
//         canvas.height / frame.height;

//     ctx.clearRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height,
//     );

//     if (frame.type !== "grid") {
//         return;
//     }

//     const cells =
//         frame.data as Uint8Array;

//     for (
//         let y = 0;
//         y < frame.height;
//         y++
//     ) {
//         for (
//             let x = 0;
//             x < frame.width;
//             x++
//         ) {
//             const value =
//                 cells[
//                     y * frame.width + x
//                 ];

//             if (value === 0) {
//                 ctx.fillStyle = "#101820";
//             } else if (value === 1) {
//                 ctx.fillStyle = "#26733a";
//             } else {
//                 ctx.fillStyle = "#ff5a24";
//             }

//             ctx.fillRect(
//                 x * scaleX,
//                 y * scaleY,
//                 scaleX + 1,
//                 scaleY + 1,
//             );
//         }
//     }
// }
