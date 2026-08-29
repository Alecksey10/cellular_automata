import React from "react";
import {
  AutomatonCard,
  type AutomatonCardProps,
} from "./AutomatonCard";

import "./AutomatonCardScroller.css";

export type AutomatonCardItem = Omit<
  AutomatonCardProps,
  "onClick" | "onHover" | "onUnHover"
>;

export type AutomatonCardScrollerProps = {
  items: AutomatonCardItem[];

  /**
   * Максимальное количество колонок.
   * Фактическое количество может быть меньше
   * на узком экране.
   */
  maxColumns: number;

  /**
   * События получают сам автомат и его индекс.
   */
  onCardClick?: (
    item: AutomatonCardItem,
    index: number
  ) => void;

  onCardHover?: (
    item: AutomatonCardItem,
    index: number
  ) => void;

  onCardUnHover?: (
    item: AutomatonCardItem,
    index: number
  ) => void;

  className?: string;
};

export function AutomatonCardScroller({
  items,
  maxColumns,
  onCardClick,
  onCardHover,
  onCardUnHover,
  className = "",
}: AutomatonCardScrollerProps) {
  return (
    <div
      className={[
        "automaton-card-scroller",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--automaton-card-columns": maxColumns,
      } as React.CSSProperties}
    >
      <div className="automaton-card-scroller__grid">
        {items.map((item, index) => (
          <AutomatonCard
            key={item.slug ?? index}
            {...item}
            onClick={
              onCardClick
                ? () => onCardClick(item, index)
                : undefined
            }
            onHover={
              onCardHover
                ? () => onCardHover(item, index)
                : undefined
            }
            onUnHover={
              onCardUnHover
                ? () => onCardUnHover(item, index)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
