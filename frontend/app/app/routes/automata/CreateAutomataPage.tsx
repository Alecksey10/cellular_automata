import { useEffect, useMemo, useState } from "react"
import Tags, { type TagData, type TagsProps } from "~/components/tags/TagsList"
import { tagsAPI } from "../../../api/tags";

import { Button } from "~/components/ui/button";

import CellularAutomatonForm,{
    type CellularAutomatonFormData,
}  from "~/components/automata/AutomataInput";
import './css.css'
import { automataAPI } from "../../../api/automata";
import type { AutomatonCreateRequest } from "../../../api/automata/types";


export default function Component()
{
    const [tags, setTags] = useState<TagData[] | null>(null)
    //Выбранные теги
    const [chosenTagsIds, setChosenTagsIds] = useState<string[]>([])

    const [datasIsReady, setDatasIsReady] = useState<boolean>(false)
    const [data, setData] = useState<CellularAutomatonFormData | null>(null)


    // уведомляем об отутствиит авторизации
    // элемент для задания исходного кода, имени и т.д.
    // также подгружаем доступные теги и предлагаем инициализиовать их
    // запрос на создание двухступенчатый - создание автомата, а затем присвоение тегов. если что не так - откат.


    // страница состоит - выбора источника для определения исходного кода - поле или файл
    // let tags = [{text:'a', tag_id:'1'},
    //     {text:'bb', tag_id:'2'}, 
    // {text:'ccc', tag_id:'3'}]
    
    const handleDataSubmit = (data: CellularAutomatonFormData) => {
    let isValid = true;
    console.log('Название:', data.name);
    console.log('Описание:', data.description);
    console.log('Исходный код:', data.sourceCode);
    //валидация пока не нужна. TODO
    if(data.name.length>0)
    {
        isValid=true
    }
    else{
        isValid=false
    }
    setDatasIsReady(isValid)
    setData(data)
  };

    //загружаем теги
    useEffect(()=>{
        let ignore = false;
        async function requestTags() {

            setTags([])

                try {
                    const response = await tagsAPI.getTags.execute();
        
                    if (!response.ok) {
                        alert(
                            response.error?.message ??
                            "Не удалось загрузить теги",
                        );
        
                        return;
                    }

                    setTags(
                    response.data!.map(tag=>{
                        return ({text:tag.name, key:tag.id} as TagData)
                    }))

                } catch {
                    alert(
                        "Ошибка соединения с сервером",
                    );
                }
                

        }
        requestTags()

        
        return ()=>{ignore=true}
    }, [])
    
    let [chooseTags, chosenTags] = useMemo(() => {
        let chooseTagsResult = tags?.filter((tag)=>
        {
            return !chosenTagsIds.includes(tag.key)
        });
        let chosenTagsResult = tags?.filter((tag)=>
        {
            return chosenTagsIds.includes(tag.key)
        });


        return [chooseTagsResult!,chosenTagsResult!]
        }, [tags, chosenTagsIds]);

    
    
    function ToggleTag(tag:TagData)
    {   
        // array = [...chosenTags]
        // элемента нет в массиве - останется новый
        // элемент есть в массиве - удалятся оба
        let new_elements;
        if(chosenTagsIds.includes(tag.key))
            new_elements = chosenTagsIds.filter(tag_key => tag_key !== tag.key)
        else
            new_elements = [...chosenTagsIds, tag.key]
        setChosenTagsIds(new_elements)
    }


    function createAutomata()
    {
        if(!datasIsReady)
        {
          alert('data is not ready')
          return;
        }
        //для создания понадобится:
        // 1) активная сессия (через куки)
        // 2) исходный код автомата и прочие данные 
        // после создания необходимо задать теги. Однако, я не хочу создавать отдельную ручку на сервере 
        // для задания тегов, а здесь при ошибке не откатить по транзакции запрос, так что пусть ошибка будет в создании автомата без тегов, их всё равно можно поправить позже
        const createAutomataMethod = automataAPI.createAutomata;
        let request:AutomatonCreateRequest = {
          name: data!.name,
          slug: data!.slug,
          description: data!.description,
          source_code: data!.sourceCode.content,
          based_on_id: null,
          tag_ids: chosenTagsIds
        };

        createAutomataMethod.execute(request).then((response)=>{
          console.log(response)
        })
        
    }
    return (
  <div className="create-automata">
    <div className="create-automata__container">

      <header className="create-automata__header">
        <h1 className="create-automata__title">
          Создание клеточного автомата
        </h1>

        <p className="create-automata__subtitle">
          Задайте параметры автомата и выберите подходящие теги.
        </p>
      </header>

      {/* Основная форма */}
      <section className="create-automata__card">
        <div className="create-automata__card-header">
          <h2 className="create-automata__card-title">
            Основные данные
          </h2>

          <p className="create-automata__card-description">
            Укажите название, описание и исходный код автомата.
          </p>
        </div>

        <CellularAutomatonForm onChange={handleDataSubmit} />
      </section>

      {/* Теги */}
      {tags !== null && (
        <section className="create-automata__card">

          <div className="create-automata__card-header">
            <h2 className="create-automata__card-title">
              Теги
            </h2>

            <p className="create-automata__card-description">
              Выберите теги, которые описывают ваш клеточный автомат.
            </p>
          </div>

          <div className="create-automata__tags">

            {/* Доступные */}
            <div className="create-automata__tag-group">

              <div className="create-automata__tag-header">
                <h3 className="create-automata__tag-title">
                  Доступные теги
                </h3>

                <span className="create-automata__tag-count">
                  {chooseTags.length}
                </span>
              </div>

              <Tags
                tags={chooseTags}
                onItemClick={(value) => {
                  ToggleTag(value);
                }}
              />

            </div>

            {/* Выбранные */}
            <div className="create-automata__tag-group create-automata__tag-group--selected">

              <div className="create-automata__tag-header">
                <h3 className="create-automata__tag-title create-automata__tag-title--selected">
                  Выбранные теги
                </h3>

                <span className="create-automata__tag-count create-automata__tag-count--selected">
                  {chosenTags.length}
                </span>
              </div>

              <Tags
                tags={chosenTags}
                onItemClick={(value) => {
                  ToggleTag(value);
                }}
              />

            </div>

          </div>
        </section>
      )}

      {/* Создание */}
      {datasIsReady && (
        <div className="create-automata__actions">
          <Button onClick={createAutomata} style={{fontSize:'20px'}}>
            Создать автомат
          </Button>
        </div>
      )}

    </div>
  </div>
);
}