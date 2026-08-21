from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.tag import TagShortResponse
from app.schemas.user import UserShortResponse


class AutomatonCardResponse(BaseModel):
    id: UUID

    name: str
    slug: str | None
    description: str | None

    source_line_count: int
    source_size: int

    owner: UserShortResponse | None

    tags: list[TagShortResponse]

    model_config = ConfigDict(
        from_attributes=True,
    )


class AutomatonResponse(AutomatonCardResponse):
    based_on_id: UUID | None

    created_at: datetime
    updated_at: datetime


class AutomatonSourceResponse(BaseModel):
    id: UUID
    source_code: str


class AutomatonCreateRequest(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=200,
    )

    slug: str | None = Field(
        default=None,
        max_length=200,
    )

    description: str | None = None

    source_code: str = Field(
        min_length=1,
    )

    based_on_id: UUID | None = None

    tag_ids: list[UUID] = Field(
        default_factory=list,
    )


class AutomatonUpdateRequest(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    slug: str | None = Field(
        default=None,
        max_length=200,
    )

    description: str | None = None

    source_code: str | None = Field(
        default=None,
        min_length=1,
    )

    based_on_id: UUID | None = None

    tag_ids: list[UUID] | None = None