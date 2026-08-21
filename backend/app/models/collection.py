from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.automaton import Automaton


class Collection(BaseModel):
    __tablename__ = "collections"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    automata: Mapped[list["Automaton"]] = relationship(
        "Automaton",
        secondary="collection_automata",
        back_populates="collections",
    )