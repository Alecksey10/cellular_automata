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
    id: string
  ) => void;

  onCardHover?: (
    item: AutomatonCardItem,
    id: string
  ) => void;

  onCardUnHover?: (
    item: AutomatonCardItem,
    id: string
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
            key={item.id_val}
            {...item}
            onClick={
              onCardClick
                ? () => onCardClick(item, item.id_val)
                : undefined
            }
            onHover={
              onCardHover
                ? () => onCardHover(item, item.id_val)
                : undefined
            }
            onUnHover={
              onCardUnHover
                ? () => onCardUnHover(item, item.id_val)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
