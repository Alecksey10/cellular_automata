
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TagShortResponse(BaseModel):
    id: UUID
    name: str
     # чтобы создавать из models SQLAlchemy
    model_config = ConfigDict(
        from_attributes=True,
    )

class TagCreateRequest(BaseModel):
    name:str



class TagResponse(BaseModel):
    id: UUID
    name: str
    automata_count: int
     # чтобы создавать из models SQLAlchemy
    model_config = ConfigDict(
        from_attributes=True,
    )
