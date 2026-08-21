export class SandProgram {
    constructor(api) {
        this.api = api;

        this.width = 0;
        this.height = 0;

        this.cells = null;

        this.iteration = 0;
    }

    init(scene) {
        this.width = scene.width;
        this.height = scene.height;

        this.cells =
            new Uint8Array(
                this.width * this.height
            );

        this.iteration = 0;

        this.seed();

        this.emitFrame();
    }

    index(x, y) {
        return y * this.width + x;
    }

    seed() {
        // Каменное дно.
        const floorY = this.height - 5;

        for (let x = 0; x < this.width; x++) {
            this.cells[
                floorY * this.width + x
            ] = 2;
        }

        // Несколько случайных камней.
        for (let i = 0; i < 20; i++) {
            const x =
                (Math.random() * this.width) | 0;

            const y =
                floorY -
                10 -
                ((Math.random() * 30) | 0);

            if (y >= 0) {
                this.cells[
                    y * this.width + x
                ] = 2;
            }
        }

        // Первая порция песка.
        this.dropSand();
    }

    dropSand() {
        const center =
            (this.width * 0.5) | 0;

        /*
         * Сыпем широким потоком сверху.
         */
        const amount =
            Math.max(10, this.width >> 2);

        for (let i = 0; i < amount; i++) {
            const x =
                center -
                (amount >> 1) +
                i;

            if (x < 0 || x >= this.width) {
                continue;
            }

            this.cells[x] = 1;
        }
    }

    step() {
        const cells = this.cells;
        const width = this.width;
        const height = this.height;

        /*
         * Каждый кадр добавляем немного песка сверху.
         */
        this.dropSand();

        /*
         * Идём снизу вверх.
         *
         * Это позволяет частицам, которые уже упали,
         * не обрабатываться снова в том же направлении.
         */
        for (let y = height - 2; y >= 0; y--) {

            /*
             * Чередуем направление обхода.
             */
            const reverse =
                ((y + this.iteration) & 1);

            if (!reverse) {
                for (let x = 1; x < width - 1; x++) {
                    this.updateSand(
                        cells,
                        x,
                        y
                    );
                }
            } else {
                for (let x = width - 2; x >= 1; x--) {
                    this.updateSand(
                        cells,
                        x,
                        y
                    );
                }
            }
        }

        this.iteration++;

        this.emitFrame();
    }

    updateSand(cells, x, y) {
        const width = this.width;

        const index =
            y * width + x;

        if (cells[index] !== 1) {
            return;
        }

        /*
         * Вниз.
         */
        const down =
            index + width;

        if (cells[down] === 0) {
            cells[down] = 1;
            cells[index] = 0;
            return;
        }

        /*
         * Диагонали.
         */
        const left =
            index + width - 1;

        const right =
            index + width + 1;

        if (Math.random() < 0.5) {
            if (cells[left] === 0) {
                cells[left] = 1;
                cells[index] = 0;
                return;
            }

            if (cells[right] === 0) {
                cells[right] = 1;
                cells[index] = 0;
                return;
            }
        } else {
            if (cells[right] === 0) {
                cells[right] = 1;
                cells[index] = 0;
                return;
            }

            if (cells[left] === 0) {
                cells[left] = 1;
                cells[index] = 0;
            }
        }
    }

    emitFrame() {
        this.api.render({
            type: "grid",
            width: this.width,
            height: this.height,
            format: "u8",

            data: this.cells,

            iteration: this.iteration,

            palette: {
                0: "#101318",
                1: "#d7ad67",
                2: "#686d75"
            }
        });
    }
}