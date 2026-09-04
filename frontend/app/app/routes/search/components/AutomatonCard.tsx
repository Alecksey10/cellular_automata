import React from "react";
import "./AutomatonCard.css";

export type AutomatonCardProps = {
  imageUrl?: string | null;
  name?: string | null;
  description?: string | null;
  slug?: string | null;
  tags?: string[];
  id_val:string;

  aspect?: "square" | "rectangle";

  onClick?: () => void;
  onHover?: () => void;
  onUnHover?: () => void;

  className?: string;
};

export function AutomatonCard({
  imageUrl,
  name,
  description,
  slug,
  tags = [],
  aspect = "square",
  onClick,
  onHover,
  onUnHover,
  className = "",
}: AutomatonCardProps) {
  const hasDetails = Boolean(
    description || slug || tags.length > 0
  );

    return (
        <article
            className={[
                "automaton-card",
                `automaton-card--${aspect}`,
                onClick ? "automaton-card--clickable" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            onClick={onClick}
            onMouseEnter={onHover}
            onMouseLeave={onUnHover}
        >
            {/* Картинка */}
            <div className="automaton-card__media">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name?"no image to "+name:"Cellular automaton"}
                        className="automaton-card__image"
                        loading="lazy"
                    />
                ) : (
                    <div className="automaton-card__placeholder">
                        No preview
                    </div>
                )}

                <div className="automaton-card__overlay" />
            </div>

            {/* Весь текстовый блок */}
            <div className="automaton-card__content">

                {/* Дополнительная информация.
          Она раскрывается вверх. */}
                {hasDetails && (
                    <div className="automaton-card__details">
                        {description && (
                            <p className="automaton-card__description">
                                {description}
                            </p>
                        )}

                        {slug && (
                            <div className="automaton-card__slug">
                                /{slug}
                            </div>
                        )}

                        {tags.length > 0 && (
                            <div className="automaton-card__tags">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="automaton-card__tag"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Название ВСЕГДА последнее.
          Поэтому оно находится внизу. */}
                {name && (
                    <h3 className="automaton-card__title">
                        {name}
                    </h3>
                )}

            </div>
        </article>
    );
}
