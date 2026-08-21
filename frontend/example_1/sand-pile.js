export class SandPileProgram {
    constructor(api) {
        this.api = api;

        this.width = 0;
        this.height = 0;

        /*
         * Здесь уже НЕ Uint8Array.
         *
         * В ячейке может накопиться сколько угодно песка,
         * поэтому используем Uint32Array.
         */
        this.cells = null;

        /*
         * Список нестабильных клеток.
         *
         * Это гораздо эффективнее, чем каждый раз
         * сканировать всю карту.
         */
        this.unstable = null;
        this.unstableCount = 0;

        /*
         * Флаг:
         *
         * 0 = клетка не находится в очереди
         * 1 = клетка уже находится в очереди
         */
        this.queued = null;

        this.iteration = 0;

        /*
         * Куда насыпаем песок.
         */
        this.sourceX = 0;
        this.sourceY = 0;

        /*
         * Сколько песка добавляется за один шаг.
         */
        this.addPerStep = 1;
    }

    init(scene) {
        this.width = scene.width;
        this.height = scene.height;

        const size =
            this.width * this.height;

        this.cells =
            new Uint32Array(size);

        this.unstable =
            new Int32Array(size);

        this.queued =
            new Uint8Array(size);

        this.unstableCount = 0;

        this.iteration = 0;

        this.sourceX =
            (this.width / 2) | 0;

        this.sourceY =
            (this.height / 2) | 0;

        /*
         * Небольшая начальная куча.
         */
        this.cells[
            this.sourceY * this.width +
            this.sourceX
        ] = 100;

        this.enqueue(
            this.sourceX,
            this.sourceY
        );

        this.emitFrame();
    }

    index(x, y) {
        return y * this.width + x;
    }

    enqueue(x, y) {
        /*
         * Края считаем открытыми:
         * песок, ушедший за границу, исчезает.
         */
        if (
            x < 0 ||
            x >= this.width ||
            y < 0 ||
            y >= this.height
        ) {
            return;
        }

        const index =
            y * this.width + x;

        if (this.queued[index]) {
            return;
        }

        if (this.cells[index] < 7) {
            return;
        }

        this.queued[index] = 1;

        this.unstable[
            this.unstableCount++
        ] = index;
    }

    /**
     * Добавить песок в источник.
     */
    addSand(amount) {
        const index =
            this.sourceY * this.width +
            this.sourceX;

        this.cells[index] += amount;

        this.enqueue(
            this.sourceX,
            this.sourceY
        );
    }

    /**
     * Стабилизировать кучу.
     *
     * Это основная часть sandpile.
     */
    stabilize() {
        const cells = this.cells;
        const width = this.width;
        const height = this.height;

        while (this.unstableCount > 0) {

            /*
             * Берём последнюю клетку из очереди.
             */
            const index =
                this.unstable[
                    --this.unstableCount
                ];

            this.queued[index] = 0;

            /*
             * Теоретически клетка могла уже стать
             * стабильной вследствие соседних операций.
             */
            if (cells[index] < 7) {
                continue;
            }

            /*
             * Координаты клетки.
             */
            const y =
                (index / width) | 0;

            const x =
                index - y * width;

            /*
             * Сколько раз клетка может
             * одновременно "обрушиться".
             *
             * Например:
             *
             * 4 -> 1 топплинг
             * 8 -> 2
             * 100 -> 25
             */
            const amount =
                (cells[index] / 4) | 0;

            const delta =
                amount * 4;

            cells[index] -= delta;

            /*
             * -----------------------------
             * Сосед слева
             * -----------------------------
             */
            if (x > 0) {
                const n = index - 1;

                cells[n] += amount;

                if (cells[n] >= 7) {
                    this.enqueue(
                        x - 1,
                        y
                    );
                }
            }

            /*
             * -----------------------------
             * Сосед справа
             * -----------------------------
             */
            if (x + 1 < width) {
                const n = index + 1;

                cells[n] += amount;

                if (cells[n] >= 7) {
                    this.enqueue(
                        x + 1,
                        y
                    );
                }
            }

            /*
             * -----------------------------
             * Сосед сверху
             * -----------------------------
             */
            if (y > 0) {
                const n = index - width;

                cells[n] += amount;

                if (cells[n] >= 7) {
                    this.enqueue(
                        x,
                        y - 1
                    );
                }
            }

            /*
             * -----------------------------
             * Сосед снизу
             * -----------------------------
             */
            if (y + 1 < height) {
                const n = index + width;

                cells[n] += amount;

                if (cells[n] >= 7) {
                    this.enqueue(
                        x,
                        y + 1
                    );
                }
            }

            /*
             * Сама клетка после топплинга
             * тоже может остаться нестабильной.
             */
            if (cells[index] >= 7) {
                this.enqueue(x, y);
            }
        }
    }

    step() {
        /*
         * Добавляем одну песчинку.
         */
        this.addSand(
            this.addPerStep
        );

        /*
         * Теперь полностью стабилизируем
         * систему.
         */
        this.stabilize();

        this.iteration++;

        this.emitFrame();
    }

    emitFrame() {
        this.api.render({
            type: "grid",

            width: this.width,
            height: this.height,

            /*
             * Нам теперь нужно визуализировать
             * не просто 0/1, а высоту.
             */
            format: "u32",

            data: this.cells,

            iteration: this.iteration,

            /*
             * Renderer может интерпретировать
             * эти состояния как высоту.
             */
            palette: {
                0: "#101318",
                1: "#383027",
                2: "#6e5c44",
                3: "#866e4f",
                4: "#9e7f58",
                5: "#bb9a70",
                6: "#d6aa71",
                7: "#ffd89e"
            },

            /*
             * Дополнительная информация
             * для будущего renderer.
             */
            valueRange: {
                min: 0,
                max: 4
            }
        });
    }
}