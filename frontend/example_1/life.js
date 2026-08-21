export class LifeProgram {
    constructor(api) {
        this.api = api;

        this.width = 0;
        this.height = 0;

        // Реальное поле находится внутри рамки.
        this.stride = 0;

        this.cells = null;
        this.next = null;

        this.iteration = 0;
    }

    init(scene) {
        this.width = scene.width;
        this.height = scene.height;

        this.stride = this.width + 2;

        const size = (this.height + 2) * this.stride;

        this.cells = new Uint8Array(size);
        this.next = new Uint8Array(size);

        this.iteration = 0;

        this.seed();
        this.emitFrame();
    }

    seed() {
        const cx = Math.floor(this.width / 2);
        const cy = Math.floor(this.height / 2);

        // Glider.
        this.set(cx + 1, cy + 0, 1);
        this.set(cx + 2, cy + 1, 1);
        this.set(cx + 0, cy + 2, 1);
        this.set(cx + 1, cy + 2, 1);
        this.set(cx + 2, cy + 2, 1);

        // Случайная жизнь.
        const count =
            Math.floor(this.width * this.height * 0.08);

        for (let i = 0; i < count; i++) {
            const x = 1 + (Math.random() * this.width) | 0;
            const y = 1 + (Math.random() * this.height) | 0;

            this.cells[y * this.stride + x] =
                Math.random() < 0.5 ? 0 : 1;
        }
    }

    set(x, y, value) {
        // x/y здесь координаты реального поля.
        if (
            x < 0 ||
            x >= this.width ||
            y < 0 ||
            y >= this.height
        ) {
            return;
        }

        this.cells[
            (y + 1) * this.stride + (x + 1)
        ] = value;
    }

    step() {
        const cells = this.cells;
        const next = this.next;
        const stride = this.stride;

        /*
         * Внутренний индекс начинается с 1.
         *
         * Для клетки i:
         *
         *   i-stride-1  i-stride  i-stride+1
         *   i-1         i         i+1
         *   i+stride-1 i+stride  i+stride+1
         */

        for (let y = 1; y <= this.height; y++) {
            let i = y * stride + 1;

            const end = i + this.width;

            for (; i < end; i++) {
                const neighbors =
                    cells[i - stride - 1] +
                    cells[i - stride] +
                    cells[i - stride + 1] +
                    cells[i - 1] +
                    cells[i + 1] +
                    cells[i + stride - 1] +
                    cells[i + stride] +
                    cells[i + stride + 1];

                const alive = cells[i];

                next[i] =
                    alive
                        ? (neighbors === 2 || neighbors === 3 ? 1 : 0)
                        : (neighbors === 3 ? 1 : 0);
            }
        }

        [this.cells, this.next] =
            [this.next, this.cells];

        this.iteration++;

        this.emitFrame();
    }

    emitFrame() {
        /*
         * Не отдаём внутренний буфер напрямую:
         * рамка должна быть невидима renderer'у.
         *
         * Пока делаем копию.
         *
         * Позже можно вообще избавиться от копирования,
         * если renderer научится работать с stride/offset.
         */

        this.api.render({
            type: "grid",
            width: this.width,
            height: this.height,
            format: "u8",

            data: this.extractField(),

            iteration: this.iteration,

            palette: {
                0: "#101318",
                1: "#eeeeee"
            }
        });
    }

    extractField() {
        const result =
            new Uint8Array(this.width * this.height);

        for (let y = 0; y < this.height; y++) {
            const source =
                (y + 1) * this.stride + 1;

            const target =
                y * this.width;

            result.set(
                this.cells.subarray(
                    source,
                    source + this.width
                ),
                target
            );
        }

        return result;
    }
}