# заполнение тестовыми данными

from app.dao.base import BaseDAO
from app.db.test_seeds.seed_1.utils import readAllData
from app.db.session import session_scope
from app.models.automaton import Automaton
from app.models.tag import Tag
import app.db
import asyncio
import argparse
from sqlalchemy import delete

async def seed() -> None:
    async with session_scope() as session:
        # Теги
        tags = {
            "demo": Tag(name="demo"),
            "ant": Tag(name="ant"),
            "dynamic": Tag(name="dynamic"),
        }

        for tag in tags.values():
            session.add(tag)

        await session.flush()

        # Демонстрационный автомат
        names = [['app/db/seeds/seed_1/CornerSmoother.ts', 'CornerSmoother'],
                 ['app/db/seeds/seed_1/FallingSand.ts', 'FallingSand'],
                 ['app/db/seeds/seed_1/ForestFire.ts', 'ForestFire'],
                 ['app/db/seeds/seed_1/IrregularMazeGenerator.ts', 'IrregularMazeGenerator'],
                 ['app/db/seeds/seed_1/LangtonsAnt.ts', 'LangtonsAnt'],
                 ['app/db/seeds/seed_1/MazeGenerator.ts', 'MazeGenerator'],
                 ['app/db/seeds/seed_1/GameOfLife.ts', 'GameOfLife'],
                 ['app/db/seeds/seed_1/GameOfLifev2.ts', 'GameOfLife v2']]
        for name in names:
            automaton = Automaton(
                name=name[1],
                slug=f"{name[1]} slug",
                description=f"{name[1]} desc",
                source_code=readAllData(name[0]),
                source_line_count=1,
                source_size=24,
            )

            automaton.tags.extend(
                [
                    tags["demo"],
                    tags["dynamic"],
                ]
            )

            session.add(automaton)
        print("done")
    print("done")

async def reseed() -> None:
    async with session_scope() as session:
        # сначала удаляем автомат. 
        automatonDAO = BaseDAO[Automaton](model=Automaton, session=session)
        automatons = await automatonDAO.get_all()
        for automaton in automatons:
            print(automaton.description)
            await automatonDAO.delete_no_commit(automaton)

        tagDAO = BaseDAO[Tag](model=Tag, session=session)
        tags = await tagDAO.get_all()
        for tag in tags:
            print(tag.name)
            await tagDAO.delete_no_commit(tag)
        print("done")
    print("done")

if __name__=="__main__":
    parser = argparse.ArgumentParser("simple_example")
    parser.add_argument("--mod", help="`feel` or `clear`", type=str,default='feel', choices=['feel', 'clear'])
    args = parser.parse_args()
    if(args.mod=="feel"):
        asyncio.run(seed())
    elif(args.mod=="clear"):
        asyncio.run(reseed())