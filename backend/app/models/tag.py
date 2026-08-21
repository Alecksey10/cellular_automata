from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.automaton import Automaton


class Tag(BaseModel):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    automata: Mapped[list["Automaton"]] = relationship(
        "Automaton",
        secondary="automaton_tags",
        back_populates="tags",
    )