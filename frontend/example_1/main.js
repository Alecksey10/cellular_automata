import {
    SimulationRuntime,
    createSimulationAPI
} from "./api.js";
import { LifeProgram } from "./life.js";
import { SandProgram } from "./sand.js";
import { SandPileProgram } from "./sand-pile.js";
import { ForestFireProgram } from "./forest-fire.js";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const startButton = document.querySelector("#start");
const pauseButton = document.querySelector("#pause");
const stepButton = document.querySelector("#step");
const resetButton = document.querySelector("#reset");

const lifeButton = document.querySelector("#life");
const sandButton = document.querySelector("#sand");

const statusElement = document.querySelector("#status");
const iterationElement = document.querySelector("#iteration");


const WIDTH = 160;
const HEIGHT = 100;

let runtime = null;
let currentSimulation = "life";


function createProgram(type, api) {
    switch (type) {
        case "life":
            return new LifeProgram(api);

        case "sand":
            return new SandProgram(api);

        case "sand-pile":
            return new SandPileProgram(api);

        case "forest":
            return new ForestFireProgram(api);

        default:
            throw new Error(
                `Unknown simulation: ${type}`
            );
    }
}


/**
 * Создание новой программы + runtime.
 */
function createSimulation(data2) {
    if (runtime) {
        runtime.pause();
    }

    /*
     * Runtime создаётся после программы, но API программы
     * должен ссылаться на runtime.
     *
     * Поэтому здесь используется небольшая замыкающаяся ссылка.
     */
    let currentRuntime = null;

    const api = Object.freeze({
        render(data) {
            currentRuntime.render(data);
        }
    });

    const program = createProgram(data2.type, api);

    currentRuntime = new SimulationRuntime(program, {
        fps: data2.fps,
        stepsPerFrame: data2.stepsPerFrame
    });

    currentRuntime.onRender = render;

    runtime = currentRuntime;

    runtime.init({
        width: WIDTH,
        height: HEIGHT
    });

    updateUI();
}


/**
 * Внешний renderer.
 *
 * Здесь пока Canvas 2D.
 *
 * Позже эту функцию можно заменить целиком на WebGL/WebGPU,
 * не меняя программы симуляций.
 */
function render(frame) {
    canvas.width = frame.width;
    canvas.height = frame.height;

    const image = ctx.createImageData(
        frame.width,
        frame.height
    );

    const pixels = image.data;

    const palette = frame.palette ?? {
        0: "#000000",
        1: "#ffffff"
    };

    for (let i = 0; i < frame.data.length; i++) {
        const state = frame.data[i];

        const color =
            palette[state] ?? "#ff00ff";

        const [r, g, b] = hexToRgb(color);

        const offset = i * 4;

        pixels[offset] = r;
        pixels[offset + 1] = g;
        pixels[offset + 2] = b;
        pixels[offset + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);

    iterationElement.textContent =
        String(frame.iteration);
}


function hexToRgb(hex) {
    hex = hex.replace("#", "");

    return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
    ];
}


function updateUI() {
    statusElement.textContent =
        runtime?.running
            ? "работает"
            : "пауза";
}


/* ------------------------------
 * UI
 * ------------------------------ */

startButton.addEventListener("click", () => {
    runtime.start();
    updateUI();
});


pauseButton.addEventListener("click", () => {
    runtime.pause();
    updateUI();
});


stepButton.addEventListener("click", () => {
    runtime.step();
    updateUI();
});


resetButton.addEventListener("click", () => {
    runtime.pause();

    runtime.init({
        width: WIDTH,
        height: HEIGHT
    });

    updateUI();
});


lifeButton.addEventListener("click", () => {
    currentSimulation = ({type:"life", fps:30, stepsPerFrame:100});

    createSimulation(
        currentSimulation
    );
});


sandButton.addEventListener("click", () => {
    currentSimulation = ({type:"sand", fps:30, stepsPerFrame:100});

    createSimulation(
        currentSimulation
    );
});
document
    .querySelector("#sand-pile")
    .addEventListener("click", () => {
        currentSimulation = ({type:"sand-pile", fps:30, stepsPerFrame:100});
        createSimulation(currentSimulation);
    });

document
    .querySelector("#forest")
    .addEventListener("click", () => {
        currentSimulation = ({type:"forest", fps:30, stepsPerFrame:100});
        createSimulation(currentSimulation);
    });


/* ------------------------------
 * Initial simulation
 * ------------------------------ */
createSimulation({type:"life", fps:30, stepsPerFrame:100});