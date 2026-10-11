// import type {
//     SimulationProgram,
//     SimulationConfig,
//     ConfigSchema,
//     RenderData,
//     InitContext,
//     StepContext,
//     PauseContext,
//     ResumeContext,
//     ConfigureContext,
// } from "~/../client_apis/v0.1";


// export default class LangtonsAnt implements SimulationProgram {
//     private width = 0;
//     private height = 0;

//     private cells!: Uint8Array;

//     private x = 0;
//     private y = 0;
//     private direction = 0;

//     private iteration = 0;

//     private config!: SimulationConfig;


//     init(context: InitContext): void {
//         this.config = {
//             ...this.getDefaultConfig(),
//             ...context.config,
//         };

//         this.width =
//             this.config.width as number;

//         this.height =
//             this.config.height as number;

//         this.cells =
//             new Uint8Array(
//                 this.width * this.height,
//             );

//         this.x =
//             (this.width / 2) | 0;

//         this.y =
//             (this.height / 2) | 0;

//         this.direction = 0;
//         this.iteration = 0;
//     }


//     step(context: StepContext): void {
//         const index =
//             this.y * this.width + this.x;

//         if (this.cells[index] === 0) {
//             this.direction =
//                 (this.direction + 1) & 3;

//             this.cells[index] = 1;
//         } else {
//             this.direction =
//                 (this.direction + 3) & 3;

//             this.cells[index] = 0;
//         }


//         switch (this.direction) {
//             case 0:
//                 this.y--;
//                 break;

//             case 1:
//                 this.x++;
//                 break;

//             case 2:
//                 this.y++;
//                 break;

//             case 3:
//                 this.x--;
//                 break;
//         }


//         if (this.x < 0) {
//             this.x = this.width - 1;
//         }

//         if (this.x >= this.width) {
//             this.x = 0;
//         }

//         if (this.y < 0) {
//             this.y = this.height - 1;
//         }

//         if (this.y >= this.height) {
//             this.y = 0;
//         }


//         this.iteration =
//             context.iteration;
//     }


//     pause(_context: PauseContext): void {
//     }

//     resume(_context: ResumeContext): void {
//     }


//     render(): RenderData {
//         return {
//             type: "ant",
//             width: this.width,
//             height: this.height,
//             iteration: this.iteration,

//             data: {
//                 cells: this.cells,

//                 ant: {
//                     x: this.x,
//                     y: this.y,
//                     direction: this.direction,
//                 },
//             },
//         };
//     }


//     getDefaultConfig(): SimulationConfig {
//         return {
//             width: 200,
//             height: 150,
//         };
//     }


//     getConfigSchema(): ConfigSchema {
//         return {
//             fields: [
//                 {
//                     key: "width",
//                     type: "integer",
//                     defaultValue: 200,
//                     min: 10,
//                     max: 1000,
//                     step: 10,
//                     hotReload: false,
//                 },
//                 {
//                     key: "height",
//                     type: "integer",
//                     defaultValue: 150,
//                     min: 10,
//                     max: 1000,
//                     step: 10,
//                     hotReload: false,
//                 },
//             ],
//         };
//     }


//     configure(
//         config: SimulationConfig,
//         _context: ConfigureContext,
//     ): void {
//         Object.assign(
//             this.config,
//             config,
//         );
//     }
//     getIteration(): number {
//         return this.iteration;
//     }

//     dispose(): void {
//     }
// }