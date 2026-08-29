from enum import StrEnum


class SearchSort(StrEnum):
    POPULAR = "popular"
    VIEWS = "views"
    SIZE = "size"
    DATE = "date"


class SearchOwner(StrEnum):
    ANY = "any"
    ME = "me"
