import { useEffect, useMemo, useReducer, useState } from "react"
import Tags, { type TagData, type TagsProps } from "~/components/tags/TagsList"
import { tagsAPI } from "../../../api/tags";

import { Button } from "~/components/ui/button";

import CellularAutomatonForm, {
  type CellularAutomatonFormData,
} from "~/components/automata/AutomataInput";
import './css.css'
import { automataAPI } from "../../../api/automata";
import type { AutomatonCreateRequest, AutomatonsGetImagesRequest, AutomatonSourceCode, AutomatonUpdateImageRequest } from "../../../api/automata/types";
import { useParams } from "react-router";
import type { AutomataUpdateRequest } from "../../../api/automata/APIMethodUpdateAutomata";
import type { AutomataRequest, AutomataSourceRequest } from "../../../api/automata/APIMethodGetAutomataByID";
import { automataActions, automataInitialState, automataReducer, type CellularAutomatonData } from "./UpdateAutomataPageReducer";
import { ImageUploader } from "~/components/ui/imageInput/ImageUploader";

export async function loader() {
  return { message: "does not do anything" };
}

export default function Component() {
  // необходимо
  // прогрузить данные об автомате
  // прогрузить его теги
  // отметить имеющиеся теги

  const { automatonId } = useParams();
  const [automataState, dispatch] = useReducer(automataReducer, automataInitialState)
  const [image, setImage] = useState<File | null>(null);

  const [tags, setTags] = useState<TagData[] | null>(null)
  // //Выбранные теги
  // const [chosenTagsIds, setChosenTagsIds] = useState<string[]>([])

  // const [datasIsReady, setDatasIsReady] = useState<boolean>(false)
  // const [data, setData] = useState<CellularAutomatonFormData | null>(null)




  const handleDataSubmit = (data: CellularAutomatonFormData) => {
    if (!data.sourceCode) {
      return;
    }
    //TODO, куда валидацию?
    dispatch(automataActions.automata_data_updated(
      {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sourceCode: data.sourceCode.content
      } as CellularAutomatonData))
  };

  //загружаем теги
  useEffect(() => {
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
        if (ignore) {
          console.warn('ignored request tags data')
          return
        }

        setTags(
          response.data!.map(tag => {
            return ({ text: tag.name, key: tag.id } as TagData)
          }))



      } catch {
        alert(
          "Ошибка соединения с сервером",
        );
      }
    }
    requestTags()
    return () => { ignore = true }
  }, [])

  //загружаем данные об автомате
  useEffect(() => {
    //пока не прогружены теги - не качаем автомат, чтобы не путать логику тегов.
    if (!tags) {
      return
    }
    console.log("DATA LOADING")
    let ignore = false;
    async function requestAutomataData() {
      try {
        //загрузка данных автомата
        const responseAutomaton = await automataAPI.getAutomata.execute({ automataID: automatonId } as AutomataRequest);

        if (!responseAutomaton.ok) {
          alert(
            responseAutomaton.error?.message ??
            "Не удалось загрузить данные об автомате",
          );

          return;
        }
        //загрузка исходного кода автомата
        const responseSource = await automataAPI.getAutomataSource.execute({ automataID: automatonId } as AutomataSourceRequest);

        if (!responseSource.ok) {
          alert(
            responseSource.error?.message ??
            "Не удалось загрузить исходный код автомата",
          );

          return;
        }
        //загрузка ссылки изображения автомата
        let imageUrl = null
        if(responseAutomaton.data!.image)
        {
          const responseImageUrl = await automataAPI.getAutomatasImages.execute({ images_ids: [responseAutomaton.data!.image] } as AutomatonsGetImagesRequest);
          if (!responseImageUrl.ok) {
            alert(
              responseImageUrl.error?.message ??
              "Не удалось загрузить ссылку изображения автомата",
            );
            return;
          }
          imageUrl = responseImageUrl.data!.automatas_data[0];
        }

        
        if (ignore) {
          console.warn('ignored request automata data')
          return
        }
        dispatch(automataActions.automata_data_downloaded({
          name: responseAutomaton.data!.name,
          slug: responseAutomaton.data!.slug,
          description: responseAutomaton.data!.description,
          sourceCode: responseSource.data!.source_code
        } as CellularAutomatonData));

        dispatch(automataActions.chosen_tags_set(responseAutomaton.data!.tags.map(tag => { return tag.id })))

      } catch {
        alert(
          "Ошибка соединения с сервером",
        );
      }


    }
    requestAutomataData()


    return () => { ignore = true }
    //теги, по идее, больше не должны меняться никогда
  }, [tags])


  let [chooseTags, chosenTags] = useMemo(() => {
    let chooseTagsResult = tags?.filter((tag) => {
      return !automataState.chosenTagsIds.includes(tag.key)
    });
    let chosenTagsResult = tags?.filter((tag) => {
      return automataState.chosenTagsIds.includes(tag.key)
    });


    return [chooseTagsResult!, chosenTagsResult!]
  }, [tags, automataState.chosenTagsIds]);



  function ToggleTag(tag: TagData) {
    // array = [...chosenTags]
    // элемента нет в массиве - останется новый
    // элемент есть в массиве - удалятся оба
    let new_elements;
    if (automataState.chosenTagsIds.includes(tag.key))
      new_elements = automataState.chosenTagsIds.filter(tag_key => tag_key !== tag.key)
    else
      new_elements = [...automataState.chosenTagsIds, tag.key]
    dispatch(automataActions.chosen_tags_set(new_elements))
  }


  function createAutomata() {
    if (!automataState.isReady) {
      alert('data is not ready')
      return;
    }
    const createAutomataMethod = automataAPI.updateAutomata;
    let request: AutomataUpdateRequest = {
      automataID: automatonId!,
      name: automataState.cellularAutomatonData!.name,
      slug: automataState.cellularAutomatonData!.slug,
      description: automataState.cellularAutomatonData!.description,
      source_code: automataState.cellularAutomatonData!.sourceCode,
      based_on_id: null,
      tag_ids: automataState.chosenTagsIds
    };

    createAutomataMethod.execute(request).then((response) => {
      console.log(response)
      if(!response.ok)
      {
        alert('ошибка' + response.error?.detail)
      }
      else
      {
        alert('автомат успешно обновлён')
      }
    })

  }

  function setAutomataImage() {

    const createAutomataMethod = automataAPI.updateAutomataImage;
    let request: AutomatonUpdateImageRequest = {
      automataID: automatonId!,
      data: image
    };

    createAutomataMethod.execute(request).then((response) => {
      console.log(response)
      if(!response.ok)
      {
        alert('ошибка' + response.error?.detail)
      }
      else
      {
        alert('Изображение успешно обновлено')
      }
    })

  }


  console.log(automataState.isDownloaded)
  return (
    <div className="create-automata">
      <div className="create-automata__container">

        <header className="create-automata__header">
          <h1 className="create-automata__title">
            Редактирование клеточного автомата
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

          {
          automataState.isDownloaded ? <CellularAutomatonForm onChange={handleDataSubmit}
            initData={{
              name: automataState.cellularAutomatonData!.name,
              slug: automataState.cellularAutomatonData!.slug,
              description: automataState.cellularAutomatonData!.description,
              sourceCode: { type: "text", content: automataState.cellularAutomatonData!.sourceCode }
            }}
            key={'loaded'}
          /> :
            <CellularAutomatonForm onChange={handleDataSubmit} key={'unloaded'}/>}

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

        {/* Редактирование */}
        {automataState.isReady && (
          <div className="create-automata__actions">
            <Button onClick={createAutomata} style={{ fontSize: '20px' }}>
              Обновить автомат
            </Button>
          </div>
        )}
        <section className="create-automata__card">
          <div className="create-automata__card-header">
            <h2 className="create-automata__card-title">
              Изображение
            </h2>
            <ImageUploader value={image} onChange={setImage} />
            {automataState.isReady && (
              <div className="create-automata__actions">
                <Button onClick={setAutomataImage} style={{ fontSize: '20px' }}>
                  Обновить изображение
                </Button>
              </div>
            )}
          </div>
        </section>

      </div>
      
      
    </div>
  );
}