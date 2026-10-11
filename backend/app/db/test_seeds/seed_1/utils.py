
def readAllData(filePath:str)->str:

    data = None
    with open(filePath) as file:
        data = file.read()
    return data
