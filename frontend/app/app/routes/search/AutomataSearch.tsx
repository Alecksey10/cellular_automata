import {
    useEffect,
    useState,
} from "react";

import { tagsAPI } from "../../../api/tags";

import type {
    Tag,
} from "../../../api/tags/types";

import type {
    AutomatonCard,
} from "../../../api/automata/types";
import { useNavigate } from "react-router";


export default function AutomataSearch() {
    const navigate = useNavigate();
    console.log('debug')

    const [tags, setTags] =
        useState<Tag[]>([]);

    const [selectedTag, setSelectedTag] =
        useState<string | null>(null);

    const [automata, setAutomata] =
        useState<AutomatonCard[]>([]);

    const [loadingTags, setLoadingTags] =
        useState(true);

    const [loadingAutomata, setLoadingAutomata] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);


    useEffect(() => {
        loadTags();
    }, []);


    async function loadTags() {
        setLoadingTags(true);
        setError(null);

        try {
            const response =
                await tagsAPI.getTags.execute();

            if (!response.ok) {
                setError(
                    response.error?.message ??
                    "Не удалось загрузить теги",
                );

                return;
            }
            console.log('теги - ')
            console.log(response.data)

            setTags(
                response.data ?? [],
            );
        } catch {
            setError(
                "Ошибка соединения с сервером",
            );
        } finally {
            setLoadingTags(false);
        }
    }


    async function selectTag(
        tagId: string,
    ) {
        setSelectedTag(tagId);
        setLoadingAutomata(true);
        setError(null);

        try {
            const response =
                await tagsAPI
                    .getAutomataByTag
                    .execute(tagId);

            if (!response.ok) {
                setError(
                    response.error?.message ??
                    "Не удалось загрузить автоматы",
                );

                return;
            }

            setAutomata(
                response.data ?? [],
            );
        } catch {
            setError(
                "Ошибка соединения с сервером",
            );
        } finally {
            setLoadingAutomata(false);
        }
    }


    function openAutomaton(
        automatonId: string,
    ) {
        navigate(
            `/automata/${automatonId}`, //TODO - хардкод пути automata
        );
    }


    return (
        <div>
            <h1>
                Автоматы
            </h1>

            {error && (
                <div>
                    {error}
                </div>
            )}


            <section>
                <h2>
                    Теги
                </h2>

                {loadingTags ? (
                    <div>
                        Загрузка тегов...
                    </div>
                ) : (
                    <div>
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() =>
                                    selectTag(tag.id)
                                }
                                aria-pressed={
                                    selectedTag === tag.id
                                }
                            >
                                {tag.name}
                                {" "}
                                ({tag.automata_count})
                            </button>
                        ))}
                    </div>
                )}
            </section>


            <section>
                <h2>
                    Автоматы
                </h2>

                {loadingAutomata && (
                    <div>
                        Загрузка...
                    </div>
                )}

                {!loadingAutomata &&
                    selectedTag &&
                    automata.length === 0 && (
                        <div>
                            В этом теге нет автоматов.
                        </div>
                    )
                }


                <div>
                    {automata.map((automaton) => (
                        <article
                            key={automaton.id}
                            onClick={() =>
                                openAutomaton(
                                    automaton.id,
                                )
                            }
                            style={{
                                cursor: "pointer",
                            }}
                        >
                            <h3>
                                {automaton.name}
                            </h3>

                            {automaton.description && (
                                <p>
                                    {
                                        automaton.description
                                    }
                                </p>
                            )}

                            <div>
                                {automaton.tags?.map(
                                    (tag) => (
                                        <span
                                            key={tag.id}
                                        >
                                            {tag.name}
                                        </span>
                                    ),
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}