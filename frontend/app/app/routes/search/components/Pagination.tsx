import React from "react";
import "./Pagination.css";

type PaginationItem =
  | number
  | "dots-left"
  | "dots-right";

export type PaginationProps = {
  /**
   * Текущая страница, начиная с 1.
   */
  currentPage: number;

  /**
   * Общее количество страниц.
   */
  totalPages: number;

  /**
   * Переход непосредственно на указанную страницу.
   */
  onPageChange: (page: number) => void;

  /**
   * Переход на предыдущую страницу.
   * Получает номер страницы, на которую произойдёт переход.
   */
  onPrevious: (page: number) => void;

  /**
   * Переход на следующую страницу.
   * Получает номер страницы, на которую произойдёт переход.
   */
  onNext: (page: number) => void;

  className?: string;
};

/**
 * Генерирует список страниц для пагинации.
 *
 * Правила:
 *
 * - если страниц <= 10 — показываем все;
 * - в начале показываем 8 страниц + последнюю;
 * - в конце показываем первую + последние 8;
 * - в середине показываем текущую + 4 страницы
 *   с каждой стороны;
 * - первая и последняя страницы всегда присутствуют;
 * - никаких дубликатов;
 * - многоточия появляются только при наличии пропуска.
 *
 * Примеры для 25 страниц:
 *
 * current = 1
 * 1 2 3 4 5 6 7 8 ... 25
 *
 * current = 5
 * 1 ... 2 3 4 5 6 7 8 9 ... 25
 *
 * current = 8
 * 1 ... 4 5 6 7 8 9 10 11 12 ... 25
 *
 * current = 12
 * 1 ... 8 9 10 11 12 13 14 15 16 ... 25
 *
 * current = 22
 * 1 ... 18 19 20 21 22 23 24 25
 */
function getPaginationItems(
  currentPage: number,
  totalPages: number
): PaginationItem[] {
  /*
   * Одна страница.
   */
  if (totalPages <= 1) {
    return [1];
  }

  /*
   * Небольшое количество страниц —
   * показываем абсолютно все.
   */
  if (totalPages <= 10) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    );
  }

  /*
   * Сначала определяем множество страниц,
   * которые должны быть видимы.
   *
   * Set гарантирует отсутствие дубликатов.
   */
  const pages = new Set<number>();

  /*
   * Первая и последняя страницы
   * всегда отображаются.
   */
  pages.add(1);
  pages.add(totalPages);

  /*
   * =========================================
   * НАЧАЛО
   * =========================================
   *
   * 1 2 3 4 5 6 7 8 ... 25
   */
  if (currentPage <= 4) {
    for (let page = 2; page <= 8; page++) {
      pages.add(page);
    }
  }

  /*
   * =========================================
   * КОНЕЦ
   * =========================================
   *
   * 1 ... 18 19 20 21 22 23 24 25
   */
  else if (currentPage >= totalPages - 3) {
    for (
      let page = totalPages - 7;
      page <= totalPages - 1;
      page++
    ) {
      pages.add(page);
    }
  }

  /*
   * =========================================
   * СЕРЕДИНА
   * =========================================
   *
   * Например currentPage = 12:
   *
   * 1 ... 8 9 10 11 12 13 14 15 16 ... 25
   */
  else {
    const start = currentPage - 4;
    const end = currentPage + 4;

    for (
      let page = start;
      page <= end;
      page++
    ) {
      /*
       * Set автоматически проигнорирует 1
       * или totalPages, если диапазон до них дойдёт.
       */
      pages.add(page);
    }
  }

  /*
   * Сортируем страницы.
   */
  const sortedPages = Array.from(pages).sort(
    (a, b) => a - b
  );

  /*
   * =========================================
   * СОЗДАЁМ UI
   * =========================================
   *
   * Например:
   *
   * [1, 2, 3, 4, 5, 8, 9, 25]
   *
   * превращается в:
   *
   * 1 2 3 4 5 ... 8 9 ... 25
   */
  const result: PaginationItem[] = [];

  for (
    let index = 0;
    index < sortedPages.length;
    index++
  ) {
    const page = sortedPages[index];

    if (index > 0) {
      const previousPage =
        sortedPages[index - 1];

      /*
       * Если между страницами есть пропуск,
       * вставляем многоточие.
       */
      if (page - previousPage > 1) {
        /*
         * Если пропуск находится после первой
         * страницы — это левое многоточие
         * относительно центрального диапазона.
         *
         * Если предыдущая страница — 1,
         * это пропуск вправо.
         */
        result.push(
          previousPage === 1
            ? "dots-right"
            : "dots-left"
        );
      }
    }

    result.push(page);
  }

  return result;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  className = "",
}: PaginationProps) {
  /*
   * Нормализуем входные значения,
   * чтобы компонент не получил, например,
   * currentPage = 0 или totalPages = -5.
   */
  const safeTotalPages = Math.max(
    1,
    Math.floor(totalPages)
  );

  const safeCurrentPage = Math.min(
    Math.max(
      1,
      Math.floor(currentPage)
    ),
    safeTotalPages
  );

  const items = getPaginationItems(
    safeCurrentPage,
    safeTotalPages
  );

  const canGoPrevious =
    safeCurrentPage > 1;

  const canGoNext =
    safeCurrentPage < safeTotalPages;

  return (
    <nav
      className={[
        "pagination",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Pagination"
    >
      {/* =====================================
          PREVIOUS
          ===================================== */}

      <button
        type="button"
        className="pagination__arrow"
        disabled={!canGoPrevious}
        aria-label="Previous page"
        onClick={() => {
          if (canGoPrevious) {
            onPrevious(
              safeCurrentPage - 1
            );
          }
        }}
      >
        <span aria-hidden="true">
          ‹
        </span>
      </button>

      {/* =====================================
          PAGES
          ===================================== */}

      <div className="pagination__pages">
        {items.map((item, index) => {
          /*
           * Многоточие.
           */
          if (
            item === "dots-left" ||
            item === "dots-right"
          ) {
            return (
              <span
                key={`${item}-${index}`}
                className="pagination__dots"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          /*
           * Обычная страница.
           */
          const isActive =
            item === safeCurrentPage;

          return (
            <button
              key={item}
              type="button"
              className={[
                "pagination__page",
                isActive
                  ? "pagination__page--active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={
                isActive
                  ? "page"
                  : undefined
              }
              onClick={() =>
                onPageChange(item)
              }
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* =====================================
          NEXT
          ===================================== */}

      <button
        type="button"
        className="pagination__arrow"
        disabled={!canGoNext}
        aria-label="Next page"
        onClick={() => {
          if (canGoNext) {
            onNext(
              safeCurrentPage + 1
            );
          }
        }}
      >
        <span aria-hidden="true">
          ›
        </span>
      </button>
    </nav>
  );
}
