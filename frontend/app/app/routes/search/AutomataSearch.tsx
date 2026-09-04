// import {
//     useEffect,
//     useState,
// } from "react";

// import { tagsAPI } from "../../../api/tags";

// import type {
//     Tag,
// } from "../../../api/tags/types";

// import type {
//     AutomatonCard,
// } from "../../../api/automata/types";
// import { useNavigate } from "react-router";


// export default function AutomataSearch() {
//     const navigate = useNavigate();
//     console.log('debug')

//     const [tags, setTags] =
//         useState<Tag[]>([]);

//     const [selectedTag, setSelectedTag] =
//         useState<string | null>(null);

//     const [automata, setAutomata] =
//         useState<AutomatonCard[]>([]);

//     const [loadingTags, setLoadingTags] =
//         useState(true);

//     const [loadingAutomata, setLoadingAutomata] =
//         useState(false);

//     const [error, setError] =
//         useState<string | null>(null);


//     useEffect(() => {
//         loadTags();
//     }, []);


//     async function loadTags() {
//         setLoadingTags(true);
//         setError(null);

//         try {
//             const response =
//                 await tagsAPI.getTags.execute();

//             if (!response.ok) {
//                 setError(
//                     response.error?.message ??
//                     "Не удалось загрузить теги",
//                 );

//                 return;
//             }
//             console.log('теги - ')
//             console.log(response.data)

//             setTags(
//                 response.data ?? [],
//             );
//         } catch {
//             setError(
//                 "Ошибка соединения с сервером",
//             );
//         } finally {
//             setLoadingTags(false);
//         }
//     }


//     async function selectTag(
//         tagId: string,
//     ) {
//         setSelectedTag(tagId);
//         setLoadingAutomata(true);
//         setError(null);

//         try {
//             const response =
//                 await tagsAPI
//                     .getAutomataByTag
//                     .execute(tagId);

//             if (!response.ok) {
//                 setError(
//                     response.error?.message ??
//                     "Не удалось загрузить автоматы",
//                 );

//                 return;
//             }

//             setAutomata(
//                 response.data ?? [],
//             );
//         } catch {
//             setError(
//                 "Ошибка соединения с сервером",
//             );
//         } finally {
//             setLoadingAutomata(false);
//         }
//     }


//     function openAutomaton(
//         automatonId: string,
//     ) {
//         navigate(
//             `/automata/${automatonId}`, //TODO - хардкод пути automata
//         );
//     }


//     return (
//         <div>
//             <h1>
//                 Автоматы
//             </h1>

//             {error && (
//                 <div>
//                     {error}
//                 </div>
//             )}


//             <section>
//                 <h2>
//                     Теги
//                 </h2>

//                 {loadingTags ? (
//                     <div>
//                         Загрузка тегов...
//                     </div>
//                 ) : (
//                     <div>
//                         {tags.map((tag) => (
//                             <button
//                                 key={tag.id}
//                                 onClick={() =>
//                                     selectTag(tag.id)
//                                 }
//                                 aria-pressed={
//                                     selectedTag === tag.id
//                                 }
//                             >
//                                 {tag.name}
//                                 {" "}
//                                 ({tag.automata_count})
//                             </button>
//                         ))}
//                     </div>
//                 )}
//             </section>


//             <section>
//                 <h2>
//                     Автоматы
//                 </h2>

//                 {loadingAutomata && (
//                     <div>
//                         Загрузка...
//                     </div>
//                 )}

//                 {!loadingAutomata &&
//                     selectedTag &&
//                     automata.length === 0 && (
//                         <div>
//                             В этом теге нет автоматов.
//                         </div>
//                     )
//                 }


//                 <div>
//                     {automata.map((automaton) => (
//                         <article
//                             key={automaton.id}
//                             onClick={() =>
//                                 openAutomaton(
//                                     automaton.id,
//                                 )
//                             }
//                             style={{
//                                 cursor: "pointer",
//                             }}
//                         >
//                             <h3>
//                                 {automaton.name}
//                             </h3>

//                             {automaton.description && (
//                                 <p>
//                                     {
//                                         automaton.description
//                                     }
//                                 </p>
//                             )}

//                             <div>
//                                 {automaton.tags?.map(
//                                     (tag) => (
//                                         <span
//                                             key={tag.id}
//                                         >
//                                             {tag.name}
//                                         </span>
//                                     ),
//                                 )}
//                             </div>
//                         </article>
//                     ))}
//                 </div>
//             </section>
//         </div>
//     );
// }

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
import type { AutomatonSearchRequest } from "../../../api/automata/types";
import { useNavigate } from "react-router";


export async function clientLoader({ params }: Route.ClientLoaderArgs) {
    //   let tags = await tagsAPI.getTags.execute();
    //   return tags.data
    await provider.initialize();
    console.warn("la provider in loader", provider)
    return provider.getInstance()
}

export default function SearchTestPage({ loaderData }: Route.ComponentProps) {
    const navigate = useNavigate();
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
        useState<SearchQuery>(
            {
                text: "",
                tags: [],
                collections: [],
                owner: "any",
                sort: "popular",
            } as SearchQuery,
        );


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
    
    async function updateAutomatas(ignoreObject:{ignore:boolean})
    {
        const response = await automataAPI.searchAutomata.execute({
                text: lastQuery.text,
                tags: lastQuery.tags?.map(tag => tag.id),
                collections: lastQuery.collections.map(collection => collection.id),
                owner: lastQuery.owner,
                sort: lastQuery.sort,
                page: currentPage,
            } as AutomatonSearchRequest
            );
            if (ignoreObject.ignore) {
                return
            }
            if (!response.ok) {
                console.error("ошибка поиска автоматов", response.status, response.error)
                return
            }

            let items = (response.data!.items.map(item => {
                return {
                    name: item.name,
                    description: item.description,
                    slug: item.slug,
                    tags: item.tags?.map(tag => tag.name),
                    id_val: item.id
                } as AutomatonCardItem
            }))

            console.log("searched automatas:", items)
            setAutomatasData(items)
            
            setCurrentPage(response.data!.page)
            setTotalPages(response.data!.total)

    }
    // при создании инициализируем все значения для триггера всех необходимых действий
    useEffect(() => {
        engine.setInput("")
    }, [])

    // реакция на смену запроса
    useEffect(() => {
        if(validation?.status==="incomplete" || validation?.status==="invalid")
            return
        console.log("current page - currentPage")
        console.log(lastQuery)

        let ignore_object = {ignore:false};
        
        updateAutomatas(ignore_object)
        return ()=>{
            ignore_object.ignore =true
        }
    }, [lastQuery, currentPage])





    // const mock_automata = [
    //     {
    //         name: "Conway's Game of Life",
    //         slug: "game-of-life",
    //         imageUrl: "/static/life.png",
    //         description: "Classic cellular automaton.",
    //         tags: ["classic", "2D"],
    //         aspect: "square" as const,
    //     },
    //     {
    //         name: "Langton's Ant",
    //         slug: "langtons-ant",
    //         imageUrl: "/static/ant.png",
    //         description: "A simple but surprisingly complex automaton.",
    //         tags: ["ant", "2D"],
    //         aspect: "rectangle" as const,
    //     }
    // ];


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

                        /*
                         * Здесь в настоящей странице:
                         *
                         * loadAutomata(query)
                         *
                         * или
                         *
                         * api.search(query)
                         */
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
                            navigate(`/automata/${automaton.id_val}`)
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
