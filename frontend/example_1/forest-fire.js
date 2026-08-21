export class ForestFireProgram {
    constructor(api) {
        this.api = api;

        this.width = 0;
        this.height = 0;

        this.cells = null;
        this.next = null;

        this.iteration = 0;

        /*
         * Вероятность появления нового дерева
         * на пустом месте.
         */
        this.growthProbability = 0.003;

        /*
         * Вероятность самовозгорания.
         */
        this.lightningProbability = 0.00003;
    }

    init(scene) {
        this.width = scene.width;
        this.height = scene.height;

        const size =
            this.width * this.height;

        this.cells =
            new Uint8Array(size);

        this.next =
            new Uint8Array(size);

        this.iteration = 0;

        this.seedForest();

        this.emitFrame();
    }

    seedForest() {
        const cells = this.cells;

        for (let i = 0; i < cells.length; i++) {
            /*
             * Примерно 65% пространства покрыто лесом.
             */
            cells[i] =
                Math.random() < 0.65
                    ? 1
                    : 0;
        }

        /*
         * Небольшая стартовая линия огня.
         */
        const y =
            (this.height * 0.5) | 0;

        for (
            let x = 0;
            x < Math.min(5, this.width);
            x++
        ) {
            cells[
                y * this.width + x
            ] = 2;
        }
    }

    step() {
        const cells = this.cells;
        const next = this.next;

        const width = this.width;
        const height = this.height;

        for (let y = 0; y < height; y++) {

            const y0 =
                y === 0 ? 0 : y - 1;

            const y1 =
                y === height - 1
                    ? height - 1
                    : y + 1;

            for (let x = 0; x < width; x++) {

                const x0 =
                    x === 0 ? 0 : x - 1;

                const x1 =
                    x === width - 1
                        ? width - 1
                        : x + 1;

                const index =
                    y * width + x;

                const state =
                    cells[index];

                /*
                 * -------------------------
                 * Пустое место
                 * -------------------------
                 */
                if (state === 0 || state === 3) {

                    next[index] =
                        Math.random() <
                        this.growthProbability
                            ? 1
                            : 0;

                    continue;
                }

                /*
                 * -------------------------
                 * Горит
                 * -------------------------
                 */
                if (state === 2) {
                    /*
                     * Огонь живёт один шаг.
                     */
                    next[index] = 3;
                    continue;
                }

                /*
                 * -------------------------
                 * Дерево
                 * -------------------------
                 */

                let fire = false;

                /*
                 * Проверяем 8 соседей.
                 */
                for (let ny = y0; ny <= y1; ny++) {

                    for (let nx = x0; nx <= x1; nx++) {

                        if (
                            nx === x &&
                            ny === y
                        ) {
                            continue;
                        }

                        if (
                            cells[
                                ny * width + nx
                            ] === 2
                        ) {
                            fire = true;
                            break;
                        }
                    }

                    if (fire) {
                        break;
                    }
                }

                if (fire) {
                    next[index] = 2;
                    continue;
                }

                /*
                 * Молния / случайное возгорание.
                 */
                if (
                    Math.random() <
                    this.lightningProbability
                ) {
                    next[index] = 2;
                    continue;
                }

                /*
                 * Обычное дерево остаётся деревом.
                 */
                next[index] = 1;
            }
        }

        [this.cells, this.next] =
            [this.next, this.cells];

        this.iteration++;

        /*
         * Периодически запускаем случайный пожар,
         * иначе при небольшом поле лес может очень быстро
         * стабилизироваться.
         */
        if (
            this.iteration % 80 === 0
        ) {
            this.startRandomFire();
        }

        this.emitFrame();
    }

    startRandomFire() {
        const x =
            (Math.random() * this.width) | 0;

        const y =
            (Math.random() * this.height) | 0;

        const index =
            y * this.width + x;

        if (this.cells[index] === 1) {
            this.cells[index] = 2;
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
                0: "#17191d", // пустота
                1: "#397a3d", // дерево
                2: "#ff8c22", // огонь
                3: "#392a20"  // выгорело
            }
        });
    }
}