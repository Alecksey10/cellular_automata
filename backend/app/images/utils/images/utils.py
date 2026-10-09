from sqlalchemy import UUID


def getFileName(index:UUID):
    return f'{str(index)}.jpg'