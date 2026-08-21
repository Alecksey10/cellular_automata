from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserShortResponse(BaseModel):
    id: UUID
    username: str

    model_config = ConfigDict(
        from_attributes=True,
    )