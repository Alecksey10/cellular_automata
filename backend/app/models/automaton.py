import uuid
from typing import TYPE_CHECKING

from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, BaseModel

if TYPE_CHECKING:
    from app.models.collection import Collection
    from app.models.tag import Tag
    from app.models.user import User
    from app.models.images import Images


class Automaton(BaseModel):
    __tablename__ = "automata"

    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    based_on_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("automata.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    slug: Mapped[str | None] = mapped_column(
        String(200),
        unique=True,
        nullable=True,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source_code: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    source_line_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    source_size: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    owner: Mapped["User | None"] = relationship(
        "User",
        back_populates="automata",
    )

    based_on: Mapped["Automaton | None"] = relationship(
        "Automaton",
        remote_side="Automaton.id",
        back_populates="derived_automata",
    )

    derived_automata: Mapped[list["Automaton"]] = relationship(
        "Automaton",
        back_populates="based_on",
    )

    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary="automaton_tags",
        back_populates="automata",
    )

    collections: Mapped[list["Collection"]] = relationship(
        "Collection",
        secondary="collection_automata",
        back_populates="automata",
    )
    
    preview_image: Mapped[uuid.UUID | None] = mapped_column(
            UUID(as_uuid=True),
            ForeignKey("images.id", ondelete="SET NULL"),
            nullable=True,
            index=True,
        )

    images: Mapped[list["Images"]] = relationship(
        "Images",
        secondary="automaton_images",
        back_populates="automata",
    )

automaton_tags = Table(
    "automaton_tags",
    Base.metadata,
    Column(
        "automaton_id",
        UUID(as_uuid=True),
        ForeignKey("automata.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        UUID(as_uuid=True),
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


collection_automata = Table(
    "collection_automata",
    Base.metadata,
    Column(
        "collection_id",
        UUID(as_uuid=True),
        ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "automaton_id",
        UUID(as_uuid=True),
        ForeignKey("automata.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

automaton_images = Table(
    "automaton_images",
    Base.metadata,
    Column(
        "automaton_id",
        UUID(as_uuid=True),
        ForeignKey("automata.id", ondelete="CASCADE"),
        primary_key=True,
        unique=True,
    ),
    Column(
        "image_id",
        UUID(as_uuid=True),
        ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    ),
)

