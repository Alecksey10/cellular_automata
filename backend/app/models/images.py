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
from app.images.utils.images.utils import getFileName


if TYPE_CHECKING:
    from app.models.automaton import Automaton

class Images(BaseModel):
    __tablename__ = "images"
    
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # file_index: Mapped[uuid.UUID] = mapped_column(
    #         UUID(as_uuid=True),
    #         nullable=False,
    #         index=True,
    #         unique=True
    #     )
    automata: Mapped[list["Automaton"]] = relationship(
            "Automaton",
            secondary="automaton_images",
            back_populates="images",
        )
    def getFileName(self):
        return getFileName(self.id)

