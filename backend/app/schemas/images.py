from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ImageRequest(BaseModel):
    id:UUID
    model_config = ConfigDict(
                from_attributes=True,
            )

class ImageResponse(BaseModel):
    id:UUID
    image_url:str
    model_config = ConfigDict(
                from_attributes=True,
            )
class ImagesResponse(BaseModel):
    automatas_data:List[ImageResponse]