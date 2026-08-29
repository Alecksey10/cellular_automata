# 1

    Да. Я бы описал это не как «классы поиска», а как слоистое окружение, где у каждого объекта есть владелец и направление зависимостей.

    Ниже — сначала концептуальная UML-модель, затем расшифровка отношений.
    1. Общая UML-картина

                               ┌─────────────────────┐
                               │       Page          │
                               │    React Page       │
                               └──────────┬──────────┘
                                          │
                             owns / creates│
                                          ▼
                               ┌─────────────────────┐
                               │ SearchEnvironment   │
                               │                     │
                               │ SearchInputEngine   │
                               └─────────┬───────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │ owns               │ owns               │ owns
                    ▼                    ▼                    ▼
           ┌────────────────┐   ┌────────────────┐   ┌─────────────────┐
           │ SearchParser   │   │SearchValidator │   │SearchCompletion │
           └────────────────┘   └────────────────┘   └────────┬────────┘
                                                               │
                                                               │ uses
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │ SearchDataProvider  │
                                                    │     <<interface>>   │
                                                    └──────────┬──────────┘
                                                               ▲
                                                               │ implements
                                                               │
                                                    ┌──────────┴──────────┐
                                                    │MockSearchDataProvider│
                                                    └─────────────────────┘


           ┌──────────────────────┐
           │ SearchQueryBuilder   │
           └──────────┬───────────┘
                      │
                      │ uses
                      ▼
           ┌─────────────────────┐
           │ SearchDataProvider  │
           └─────────────────────┘


    ┌────────────────────┐
    │    SearchInput     │
    │   React Component  │
    └─────────┬──────────┘
              │
              │ uses
              ▼
    ┌─────────────────────────┐
    │ SearchInputEngine       │
    │        <<interface>>    │
    └────────────┬────────────┘
                 ▲
                 │ implements
                 │
    ┌────────────┴────────────┐
    │ SearchEnvironment       │
    └─────────────────────────┘

    Здесь уже видно главное:

        SearchEnvironment — композиционный корень поисковой системы.

    А SearchInput не является частью самой поисковой логики.
    2. Кто кем владеет

    Самая верхняя связь:

    Page
      │
      └── owns ──> SearchEnvironment

    Страница создаёт environment и определяет его жизненный цикл.

    Например:

    Page mounted
        ↓
    create SearchEnvironment
        ↓
    use SearchInput
        ↓
    Page unmounted
        ↓
    environment becomes unused

    При этом страница не владеет внутренними компонентами environment напрямую.

    То есть концептуально:

    Page
    └── SearchEnvironment
        ├── SearchParser
        ├── SearchValidator
        ├── SearchCompletion
        └── SearchQueryBuilder

    Это именно composition, а не просто набор независимых объектов.
    3. SearchEnvironment владеет механизмами поиска

    SearchEnvironment — центральный объект.

    Он владеет:

    SearchParser
    SearchValidator
    SearchCompletion
    SearchQueryBuilder
    SearchInputState

    То есть:

    SearchEnvironment
    ├── parser
    ├── validator
    ├── completion
    ├── queryBuilder
    └── state

    Но он не владеет SearchDataProvider в том же смысле.

    Почему?

    Потому что provider передаётся извне:

    new SearchEnvironment(
        dataProvider,
    )

    Это dependency injection.

    Поэтому UML лучше обозначить:

    SearchEnvironment ..> SearchDataProvider

    а не:

    SearchEnvironment *-- SearchDataProvider

    4. SearchEnvironment реализует SearchInputEngine

    Это отдельное важное отношение:

    SearchInputEngine <<interface>>
                 ▲
                 │ implements
                 │
    SearchEnvironment

    То есть SearchEnvironment — конкретная реализация публичного контракта движка.

    Компоненту SearchInput не обязательно знать:

    SearchEnvironment

    Ему достаточно:

    SearchInputEngine

    Поэтому:

    SearchInput
        │
        │ depends on
        ▼
    SearchInputEngine

    а не:

    SearchInput
        │
        ▼
    SearchEnvironment

    Это одна из основных архитектурных границ.
    5. SearchInput использует SearchInputEngine

    SearchInput — React-компонент.

    Он:
        получает engine;
        читает его начальное состояние;
        подписывается на изменения;
        отправляет ему команды.

    То есть:

    SearchInput
        ..> SearchInputEngine

    Он не владеет engine.

    Engine существует независимо от React-компонента.

    Это позволяет:

    Page
     ├── SearchEnvironment
     │
     └── SearchInput
            │
            └── uses ──> SearchEnvironment

    6. SearchEnvironment владеет Parser

    SearchEnvironment
        *-- SearchParser

    Почему именно composition?

    Потому что parser — внутренняя часть реализации environment.

    Страница не должна делать:

    new SearchParser()

    Parser не является самостоятельной частью публичной API страницы.

    То же самое относится к:

    SearchValidator
    SearchCompletion
    SearchQueryBuilder

    7. Parser не знает об Environment

    Это принципиально.

    Связь:

    Environment ──uses──> Parser

    Но обратной связи нет:

    Parser -X-> Environment

    Parser получает строку:

    parse(input)

    и возвращает:

    ParsedSearchQuery

    Поэтому его можно тестировать отдельно:

    "tag:game owner:me"
            ↓
    SearchParser
            ↓
    ParsedSearchQuery

    без React, API и Environment.
    8. Validator зависит от результата Parser

    Концептуально:

    SearchParser
          │
          ▼
    ParsedSearchQuery
          │
          ▼
    SearchValidator

    Но в текущей реализации Environment является координатором:

    Environment
     ├── Parser
     └── Validator

    То есть Validator не обязан напрямую владеть Parser.

    Это важно.

    Не надо создавать:

    Validator
      └── Parser

    Иначе начнётся цепочка скрытых зависимостей.

    Лучше:

    Environment
        │
        ├── parser.parse()
        │
        └── validator.validate(parsed)

    9. Completion использует DataProvider

    Здесь уже другая зависимость:

    SearchCompletion
           ..>
    SearchDataProvider

    Completion говорит:

        Мне нужны теги и коллекции.

    Но ему всё равно, откуда они пришли.

    Поэтому:

    SearchCompletion
            │
            ▼
    SearchDataProvider <<interface>>
            ▲
            │
            ├── MockSearchDataProvider
            │
            └── ApiSearchDataProvider

    Это позволит потом спокойно заменить mock на API.
    10. QueryBuilder также использует DataProvider

    QueryBuilder делает похожую вещь:

    tag:game

    нужно преобразовать в:

    SearchTag {
        id: "...",
        name: "game"
    }

    Поэтому:

    SearchQueryBuilder
            ..>
    SearchDataProvider

    То есть два независимых потребителя используют один источник данных:

                   ┌──────────────────┐
                   │ SearchDataProvider│
                   └────────▲─────────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  │                   │
          SearchCompletion     SearchQueryBuilder

    11. MockSearchDataProvider реализует интерфейс

    SearchDataProvider
           ▲
           │ implements
           │
    MockSearchDataProvider

    И в будущем:

    SearchDataProvider
           ▲
           │
           ├── MockSearchDataProvider
           │
           ├── ApiSearchDataProvider
           │
           └── CachedSearchDataProvider

    Это особенно хорошо ложится на твою первоначальную идею про докачку и актуализацию тегов/подборок.
    12. SearchTypes — не объект системы

    SearchTypes.ts немного отличается.

    Это не класс и не runtime-сущность.

    Он определяет контракты данных:

    SearchTag
    SearchCollection
    SearchQuery
    SearchValidation
    SearchSuggestion
    SearchSort
    SearchOwner

    Их используют разные слои.

    Например:

    SearchParser
           │
           ▼
    ParsedSearchQuery

    SearchValidator
           │
           ▼
    SearchValidation

    SearchCompletion
           │
           ▼
    SearchSuggestion

    SearchQueryBuilder
           │
           ▼
    SearchQuery

    То есть типы являются общим языком между подсистемами.
    13. SearchInputState

    Это состояние environment, а не отдельный сервис.

    SearchEnvironment
        *-- SearchInputState

    Состояние содержит:

    value
    suggestions
    suggestionsVisible
    focused
    validation

    Таким образом, SearchInput не хранит собственную независимую модель поиска.

    Он отображает:

    SearchEnvironment.state

    и локально хранит только React-состояние, необходимое для рендера.
    14. Событийная связь

    Есть ещё одна связь, которую обычная UML class diagram плохо показывает.

    SearchEnvironment уведомляет SearchInput:

    SearchEnvironment
           │
           │ subscribeInput()
           ▼
    SearchInput

    Фактически:

    Environment
        │
        ├── state changed
        │
        ▼
    listeners
        │
        ▼
    SearchInput

    Это Observer-подобная модель.

    Поэтому концептуально можно обозначить:

    SearchEnvironment
          │
          │ publishes
          ▼
    SearchInputListener
          ▲
          │ subscribes
          │
    SearchInput

    15. Внешние события страницы

    А вот здесь направление обратное:

    SearchInput
          │
          │ callbacks
          ▼
    Page

    Например:

    onChange
    onValidationChange
    onSubmit
    onFocus
    onBlur
    onEscape

    Получается очень чёткая граница:

                     Search subsystem
            ┌───────────────────────────────┐
            │                               │
            │  SearchEnvironment             │
            │        ▲                       │
            │        │                       │
            │  SearchInputEngine             │
            │        ▲                       │
            │        │                       │
            └────────┼───────────────────────┘
                     │
                SearchInput
                     │
                     │ callbacks
                     ▼
                    Page

    16. Полная UML-схема

    Если свести всё в одну диаграмму:

    ┌──────────────────────┐
    │         Page         │
    │      React Page      │
    └──────────┬───────────┘
               │
               │ owns
               ▼
    ┌─────────────────────────────┐
    │    SearchEnvironment        │
    │                             │
    │ <<implements>>              │
    │ SearchInputEngine           │
    └───────┬──────┬──────┬───────┘
            │      │      │
          owns   owns   owns
            │      │      │
            ▼      ▼      ▼
       ┌───────┐ ┌──────────┐ ┌─────────────────┐
       │Parser │ │Validator │ │   Completion    │
       └───────┘ └──────────┘ └────────┬────────┘
                                        │
                                      uses
                                        │
                                        ▼
                              ┌────────────────────┐
                              │ SearchDataProvider │
                              │    <<interface>>   │
                              └─────────▲──────────┘
                                        │
                                  implements
                                        │
                              ┌─────────┴──────────┐
                              │MockDataProvider    │
                              └────────────────────┘


       ┌───────────────────┐
       │  QueryBuilder     │
       └─────────┬─────────┘
                 │
               uses
                 │
                 ▼
          SearchDataProvider


    ┌─────────────────────────┐
    │      SearchInput        │
    │     React Component     │
    └───────────┬─────────────┘
                │
              uses
                │
                ▼
    ┌─────────────────────────┐
    │   SearchInputEngine     │
    │      <<interface>>      │
    └───────────▲─────────────┘
                │
            implements
                │
       SearchEnvironment


    SearchEnvironment
           │
           │ publishes state
           ▼
    SearchInputListener
           ▲
           │ subscribes
           │
    SearchInput


    SearchInput
           │
           │ callbacks
           ▼
          Page

    17. Если формализовать типы связей

    Я бы зафиксировал следующие отношения в документации:
    Сущность	Отношение	Сущность
    Page	owns	SearchEnvironment
    Page	uses	SearchInput
    SearchInput	depends on	SearchInputEngine
    SearchEnvironment	implements	SearchInputEngine
    SearchEnvironment	owns	SearchParser
    SearchEnvironment	owns	SearchValidator
    SearchEnvironment	owns	SearchCompletion
    SearchEnvironment	owns	SearchQueryBuilder
    SearchEnvironment	owns	SearchInputState
    SearchCompletion	depends on	SearchDataProvider
    SearchQueryBuilder	depends on	SearchDataProvider
    MockSearchDataProvider	implements	SearchDataProvider
    SearchEnvironment	publishes	SearchInputState
    SearchInput	subscribes to	SearchEnvironment
    SearchInput	notifies	Page
    18. Главная архитектурная граница

    В документации я бы отдельно выделил вот это:

    ┌─────────────────────────────────────────────┐
    │              SEARCH DOMAIN                  │
    │                                             │
    │  Environment                                │
    │  Parser                                     │
    │  Validator                                  │
    │  Completion                                 │
    │  QueryBuilder                               │
    │  DataProvider                               │
    │  SearchQuery / SearchSuggestion / State     │
    │                                             │
    └───────────────────────┬─────────────────────┘
                            │
                      public interfaces
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
           React SearchInput         Page

    Search domain ничего не должен знать о React.

    А React знает только публичные контракты:

    SearchInputEngine
    SearchQuery
    SearchValidation
    SearchSuggestion

    Это, пожалуй, наиболее важная концепция всей сегодняшней архитектуры: поисковая система должна быть переносимой и тестируемой независимо от страницы и UI, а React-компонент — лишь адаптером этой системы к пользовательскому вводу.

ChatGPT — это ИИ, который может допускать ошибки.
