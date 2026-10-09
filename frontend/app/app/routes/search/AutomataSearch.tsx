import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { SearchEnvironment, type SearchEnvironmentOptions } from "./search/SearchEnvironment";
import { MockSearchDataProvider } from "./search/data/MockSearchDataProvider";

import type { SearchState } from "./search/SearchState";


import {
    SearchInput,
} from "./components/SearchInput";

import type {
    SearchQuery,
    SearchValidation,
} from "./search/SearchTypes";
import { AutomatonCard } from "./components/AutomatonCard";
import { AutomatonCardScroller, type AutomatonCardItem } from "./components/AtuomatonCardScroller";
import { Pagination } from "./components/Pagination";
import { buildAutomataSearchUrl } from "./search/convertation/QueryConvertation";
import { tagsAPI } from "../../../api/tags";
import type { Route } from "./+types/AutomataSearch";
import { provider, SingleTon } from "./search/data/MockTaggedSearchDataProvider";
import { automataAPI } from "../../../api/automata";
import type { AutomatonSearchRequest, AutomatonsGetImagesRequest } from "../../../api/automata/types";
import { useNavigate } from "react-router";
import { apiConfig } from "../../../api/Config";
import { SearchQueryUriSerializer } from "./search/utils/SearchQueryUriSerializer";
import { SearchQuerySerializer } from "./search/utils/SearchQuerySerializer";
// import { requestAutomatonSearchToUri } from "../../../api/automata/utils";


export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    //   let tags = await tagsAPI.getTags.execute();
    //   return tags.data
    await provider.initialize();
    console.warn("la provider in loader", provider)
    return provider.getInstance()
}

export default function SearchTestPage({ loaderData }: Route.ComponentProps) {
    const current_location = window.location.search.toString().slice(1) //значок вопроса убираем
    const initial_query = new SearchQueryUriSerializer().deserialize(current_location)
    const engine =
        useMemo(
            () => {
                let result = new SearchEnvironment(
                    loaderData as unknown as MockSearchDataProvider,
                    { initialValue: "" } as SearchEnvironmentOptions
                );
                return result;
            }, []);
    
    const [lastQuery, setLastQuery] =
            useState<SearchQuery>(initial_query);
   
    const [validation, setValidation] =
        useState<SearchValidation | null>(
            null,
        );
    let [currentPage, setCurrentPage] = useState(1);
    let [totalPages, setTotalPages] = useState(1);

    // есть текущие автоматы, изменяем их только при:
    // 1) подтверждении на смену запроса
    // 2) смену номера странички
    // при этом на каждое подобное действие происходит запрос на сервер для получения данных об автоматах

    let [automatasData, setAutomatasData] = useState<AutomatonCardItem[]>([])
    
    async function updateAutomatas(ignoreObject: { ignore: boolean }) {
        const searchRequest = 
        {
            uri: `${new SearchQueryUriSerializer().serialize(lastQuery)}`
        }
        const searchRequestServer = 
        {
            //TODO надо переписывать всё. Методы разраслись, нет привязки к странице в запросах. Не продумал.
            uri: `${new SearchQueryUriSerializer().serializeClearServer(lastQuery)}`+`&page=${currentPage}`
        }
        const response_items = await automataAPI.searchAutomata.execute(searchRequestServer);

        if (ignoreObject.ignore) {
            return
        }
        if (!response_items.ok) {
            console.error("ошибка поиска автоматов", response_items.status, response_items.error)
            return
        }

        let is_preview_images = response_items.data!.items.filter((item)=>!(item.preview_image === null) ).length>0
        //Загрузка путей изображений

        let images_data:any[] = []
        if (is_preview_images) {
            const response_images_urls = await automataAPI.getAutomatasImages.execute(
                {
                    images_ids: response_items.data!.items.map((automaton) => automaton.preview_image).filter((id) => id)
                } as AutomatonsGetImagesRequest
            )
            if (!response_images_urls.ok) {
                console.error("ошибка загрузки изображений автоматов", response_images_urls.status, response_images_urls.error)
                return
            }
            images_data =response_images_urls.data!.automatas_data
        }

        let items = (response_items.data!.items.map(item => {
            return {
                name: item.name,
                description: item.description,
                slug: item.slug,
                tags: item.tags?.map(tag => tag.name),
                id_val: item.id,
                //ищем подходящий элемент
                imageUrl: item.preview_image?[apiConfig.staticURL, images_data.find(data=>data.id==item.preview_image)?.image_url].join(""):undefined
            } as AutomatonCardItem
        }))

        console.log("searched automatas:", items)
        setAutomatasData(items)
        setCurrentPage(response_items.data!.page)
        setTotalPages(response_items.data!.total)
        
        const params = new URLSearchParams(`${searchRequest.uri}`);

        const url = new URL(window.location.toString());
        url.search = params.toString();

        history.replaceState(null, '', url);        
    }
    // при создании инициализируем все значения для триггера всех необходимых действий
    useEffect(() => {
        let fu = async ()=>
        {
            await engine.setInput(new SearchQuerySerializer().serialize(initial_query))
            setLastQuery(initial_query)
        }
        fu()
    },[])

    // реакция на смену запроса
    useEffect(() => {
        if(validation?.status==="incomplete" || validation?.status==="invalid")
            return         
        let ignore_object = {ignore:false};
        
        updateAutomatas(ignore_object)
        return ()=>{
            ignore_object.ignore =true
        }
    }, [lastQuery, currentPage])

    return (
        <>
            <main
                style={{
                    maxWidth: "90%",

                    margin:
                        "80px auto",

                    padding:
                        "0 20px",
                }}
            >
                <SearchInput
                    engine={engine}
                    onChange={value => {
                        console.log(
                            "Input changed:",
                            value,
                        );
                    }}
                    onValidationChange={
                        validation => {

                            console.log(
                                "Validation:",
                                validation,
                            );

                            setValidation(
                                validation,
                            );
                        }
                    }
                    onSubmit={query => {

                        console.log(
                            "Search submitted:",
                            query,
                        );
                        setLastQuery(
                            query,
                        );
                        setCurrentPage(1);
                    }}
                    onFocus={() => {

                        console.log(
                            "Search focused",
                        );
                    }}
                    onBlur={() => {

                        console.log(
                            "Search blurred",
                        );
                    }}
                    onEscape={() => {

                        console.log(
                            "Escape pressed",
                        );
                    }}
                />
                <section
                    style={{
                        marginTop: 30,
                    }}
                >
                    <h3>
                        Validation
                    </h3>
                    <pre>
                        {JSON.stringify(
                            validation,
                            null,
                            2,
                        )}
                    </pre>


                    <h3>
                        Last submitted query
                    </h3>


                    <pre>
                        {JSON.stringify(
                            lastQuery,
                            null,
                            2,
                        )}
                        <div>
                            {lastQuery ? buildAutomataSearchUrl(lastQuery, currentPage) : "no query"}
                        </div>
                    </pre>

                </section>

                <div
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <AutomatonCardScroller
                        items={automatasData}
                        maxColumns={4}
                        onCardClick={(automaton) => {
                            console.log("clicked:", automaton.slug);
                            window.open(`/automata/${automaton.id_val}`, '_blank', 'noopener,noreferrer');
                        }}
                        onCardHover={(automaton) => {
                            console.log("hover:", automaton.slug);
                        }}
                        onCardUnHover={(automaton) => {
                            console.log("unhover:", automaton.slug);
                        }}
                    />
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}

                    onPageChange={(page) => {
                        setCurrentPage(page);
                    }}

                    onPrevious={(page) => {
                        setCurrentPage(page);
                    }}

                    onNext={(page) => {
                        setCurrentPage(page);
                    }}
                />
            </main>

        </>
    );
}
