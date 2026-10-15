
# API-клиент

API-клиент построен вокруг базовых классов, которые скрывают общую работу с `fetch`, обработку HTTP-ответов и ошибок.

Новые API-запросы рекомендуется группировать по контексту/домену:

```
./
├── APIMethodBase.ts
├── APIMethodResponseBase.ts
├── APIMethodDataResponse.ts
├── Config.ts
│
└── auth/
├── auth.ts
├── endpoints.ts
└── index.ts
│
...
```

Например, всё, что относится к авторизации, находится в `auth/`.

---

## 1\. Базовые классы

### `APIMethodBase`

`APIMethodBase` — основной базовый класс для API-запросов.

Он отвечает за:

- выполнение HTTP-запроса через `fetch`;
- добавление `baseUrl`;
- установку стандартного `Content-Type`;
- отправку cookies через `credentials: "include"`;
- сериализацию `body` в JSON;
- получение JSON-ответа;
- создание объекта ошибки.

Жизненный цикл запроса:

```
APIMethodLogin.execute()
    │
    ▼
APIMethodBase.request()
    │
    ▼
fetch(baseUrl + path)
    │
    ▼
Response + JSON
    │
    ▼
createResponse()
    │
    ▼
APIMethodDataResponse
```

### `request()`

Основной метод:

```
protected async request(
path: string,
request: APIMethodRequest = {},
): Promise<TResponse>
```

Параметры:

- `path` — endpoint, например `/auth/login`;
- `request.method` — HTTP-метод, по умолчанию `GET`;
- `request.body` — тело запроса;
- `request.headers` — дополнительные HTTP-заголовки.

Пример:

```
return this.request(
"/users",
{
    method: "POST",
    body: {
        name: "John",
    },
},
);
```

`body` автоматически преобразуется в JSON:

```
JSON.stringify(request.body)
```

По умолчанию устанавливается:

```
Content-Type: application/json
```

Также используется:

```
credentials: "include"
```

Это позволяет отправлять cookies вместе с запросом.

---

### `createResponse()`

Каждый API-метод обязан реализовать:

```
protected abstract createResponse(
response: Response,
data: unknown,
): TResponse;
```

Этот метод преобразует обычный `Response` от `fetch` в конкретный тип ответа API.

Например:

```
protected createResponse(
response: Response,
data: unknown,
): APIMethodDataResponse<User> {

if (!response.ok) {
    return new APIMethodDataResponse<User>(
        response,
        undefined,
        this.createError(
            response,
            data,
        ),
    );
}

return new APIMethodDataResponse(
    response,
    data as User,
);
}
```

Таким образом, каждый API-метод определяет, какой тип данных он ожидает в успешном ответе.

---

### `createError()`

`APIMethodBase` также содержит общий механизм создания ошибок:

```
protected createError(
response: Response,
data: unknown,
): APIError
```

Если сервер вернул JSON с ошибкой:

```
{
"code": "INVALID_CREDENTIALS",
"message": "Invalid username or password",
"detail": {}
}
```

то эти данные будут преобразованы в `APIError`.

Если сервер не вернул подходящий JSON, будет создана базовая ошибка на основе HTTP status:

```
HTTP 400
HTTP 401
HTTP 404
HTTP 500
```

---

## 2\. `APIMethodResponseBase`

`APIMethodResponseBase` — базовый класс для всех ответов API.

Он содержит:

```
readonly ok: boolean;
readonly status: number;
readonly error?: APIError;
```

### `ok`

Показывает, успешно ли завершился HTTP-запрос.

```
if (response.ok) {
// запрос успешен
}
```

### `status`

HTTP status code:

```
200
201
400
401
404
500
...
```

Например:

```
if (response.status === 401) {
// пользователь не авторизован
}
```

### `error`

При неуспешном запросе здесь находится информация об ошибке:

```
export interface APIError {
code?: string;
message?: string;
detail?: unknown;
}
```

Например:

```
if (response.error) {
console.log(response.error.message);
}
```

---

## 3\. `APIMethodDataResponse<T>`

`APIMethodDataResponse<T>` используется, когда API возвращает данные.

```
class APIMethodDataResponse<T>
extends APIMethodResponseBase
```

Основное дополнительное поле:

```
readonly data?: T;
```

`T` — тип данных, которые возвращает endpoint.

Например:

```
APIMethodDataResponse<User>
```

означает:

```
response.data // User | undefined
```

Для списка пользователей:

```
APIMethodDataResponse<User[]>
```

Для одного пользователя:

```
APIMethodDataResponse<User>
```

---

## 4\. `Config.ts`

Конфигурация API находится в `Config.ts`:

```
export interface ApiConfig {
baseUrl: string;
staticURL: string;
}

const defaultBaseUrl = "http://localhost:8000";

const baseUrl: string =
import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

export const apiConfig: ApiConfig = {
baseUrl,
staticURL: baseUrl,
};
```

Все запросы используют этот URL автоматически.

Например:

```
this.request("/auth/me")
```

превратится в запрос:

```
http://localhost:8000/auth/me
```

Чтобы изменить адрес API, задайте переменную окружения
`VITE_API_BASE_URL` (файл `.env` рядом с `package.json`,
шаблон — `.env.example`; подробности — `docs/configuration.md`).
Локально по умолчанию используется `http://localhost:8000`.

---

# 5\. Как добавить новый API-запрос

Новый API-запрос состоит из нескольких частей:

1. Добавить endpoint.
1. Определить тип запроса.
2. Определить тип ответа.
3. Создать класс `APIMethod...`.
4. Реализовать `execute()`.
5. Реализовать `createResponse()`.
6. Экспортировать метод через `index.ts`.

---

## Шаг 1. Добавить endpoint

Endpoints рекомендуется хранить отдельно от реализации запросов.

Например:

```
users/
├── users.ts
├── endpoints.ts
└── index.ts
```

`users/endpoints.ts`:

```
export const API_PREFIX = "";

export const USERS_PREFIX =
`${API_PREFIX}/users`;

export const USERS_ENDPOINTS = {
list: `${USERS_PREFIX}`,
get: (id: number) =>
    `${USERS_PREFIX}/${id}`,
create: `${USERS_PREFIX}`,
} as const;
```

URL не нужно писать непосредственно внутри API-классов.

---

# 6\. GET-запрос без параметров

Предположим, API предоставляет:

```
GET /users
```

и возвращает:

```
[
{
    "id": 1
}
]
```

Определяем тип:

```
export interface User {
id: number;
}
```

Создаём API-метод:

```
export class APIMethodUsers
extends APIMethodBase<
    APIMethodDataResponse<User[]>
> {

async execute(): Promise<
    APIMethodDataResponse<User[]>
> {
    return this.request(
        USERS_ENDPOINTS.list,
    );
}

protected createResponse(
    response: Response,
    data: unknown,
): APIMethodDataResponse<User[]> {

    if (!response.ok) {
        return new APIMethodDataResponse<User[]>(
            response,
            undefined,
            this.createError(
                response,
                data,
            ),
        );
    }

    return new APIMethodDataResponse(
        response,
        data as User[],
    );
}
}
```

Использование:

```
const response =
await new APIMethodUsers().execute();

if (response.ok) {
console.log(response.data);
}
```

---

# 7\. GET-запрос с параметром в URL

Для запроса:

```
GET /users/10
```

endpoint можно описать как функцию:

```
get: (id: number) =>
`${USERS_PREFIX}/${id}`,
```

API-метод:

```
export class APIMethodUser
extends APIMethodBase<
    APIMethodDataResponse<User>
> {

async execute(
    id: number,
): Promise<APIMethodDataResponse<User>> {

    return this.request(
        USERS_ENDPOINTS.get(id),
    );
}

protected createResponse(
    response: Response,
    data: unknown,
): APIMethodDataResponse<User> {

    if (!response.ok) {
        return new APIMethodDataResponse<User>(
            response,
            undefined,
            this.createError(
                response,
                data,
            ),
        );
    }

    return new APIMethodDataResponse(
        response,
        data as User,
    );
}
}
```

Использование:

```
const response =
await new APIMethodUser().execute(10);
```

---

# 8\. POST-запрос

Для POST-запроса нужно передать `method` и `body`.

Например:

```
POST /users
```

с телом:

```
{
"name": "John"
}
```

Определяем тип запроса:

```
export interface CreateUserRequest {
name: string;
}
```

API-метод:

```
export class APIMethodCreateUser
extends APIMethodBase<
    APIMethodDataResponse<User>
> {

async execute(
    request: CreateUserRequest,
): Promise<APIMethodDataResponse<User>> {

    return this.request(
        USERS_ENDPOINTS.create,
        {
            method: "POST",
            body: request,
        },
    );
}

protected createResponse(
    response: Response,
    data: unknown,
): APIMethodDataResponse<User> {

    if (!response.ok) {
        return new APIMethodDataResponse<User>(
            response,
            undefined,
            this.createError(
                response,
                data,
            ),
        );
    }

    return new APIMethodDataResponse(
        response,
        data as User,
    );
}
}
```

---

# 9\. PUT / PATCH

Для `PUT` и `PATCH` используется тот же подход:

```
return this.request(
USERS_ENDPOINTS.update(id),
{
    method: "PUT",
    body: request,
},
);
```

или:

```
return this.request(
USERS_ENDPOINTS.update(id),
{
    method: "PATCH",
    body: request,
},
);
```

---

# 10\. DELETE и запросы без данных

Если endpoint не возвращает объект, можно создать отдельный класс ответа.

Например:

```
export class APIMethodDeleteUserResponse
extends APIMethodResponseBase {
}
```

Сам запрос:

```
export class APIMethodDeleteUser
extends APIMethodBase<
    APIMethodDeleteUserResponse
> {

async execute(
    id: number,
): Promise<APIMethodDeleteUserResponse> {

    return this.request(
        USERS_ENDPOINTS.delete(id),
        {
            method: "DELETE",
        },
    );
}

protected createResponse(
    response: Response,
    data: unknown,
): APIMethodDeleteUserResponse {

    if (!response.ok) {
        return new APIMethodDeleteUserResponse(
            response,
            this.createError(
                response,
                data,
            ),
        );
    }

    return new APIMethodDeleteUserResponse(
        response,
    );
}
}
```

В таком случае результат содержит:

```
response.ok
response.status
response.error
```

но не содержит `response.data`.

---

# 11\. Группировка запросов

Запросы рекомендуется группировать по предметной области.

Например:

```
auth/
auth.ts
endpoints.ts
index.ts

users/
users.ts
endpoints.ts
index.ts

orders/
orders.ts
endpoints.ts
index.ts
```

Например, в `auth` находятся:

```
APIMethodLogin
APIMethodRegister
APIMethodMe
APIMethodLogout
```

В `users`:

```
APIMethodUsers
APIMethodUser
APIMethodCreateUser
APIMethodDeleteUser
...
```

Не рекомендуется складывать все API-запросы в один файл.

---

# 12\. `index.ts`

`index.ts` является публичной точкой входа для модуля.

Например:

```
export {
APIMethodLogin,
} from "./auth";

export {
APIMethodRegister,
type RegisterRequest,
type RegisterResponse,
} from "./auth";

export {
APIMethodMe,
} from "./auth";

export {
APIMethodLogout,
} from "./auth";
```

После этого внешний код может импортировать API-методы:

```
import {
APIMethodLogin,
APIMethodMe,
} from "./auth";
```

Вместо прямого импорта:

```
import {
APIMethodLogin,
} from "./auth/auth";
```

---

# 13\. Обработка результата

API-метод возвращает не непосредственно данные, а объект ответа.

Например:

```
const result =
await new APIMethodLogin().execute({
    username: "john",
    password: "123",
});
```

У результата есть:

```
result.ok
result.status
result.data
result.error
```

Типичная обработка:

```
if (!result.ok) {
console.error(result.error);
return;
}

const user = result.data;

console.log(user);
```

HTTP-ошибки (`400`, `401`, `404`, `500` и т. д.) не нужно обрабатывать через `try/catch`.

Они представлены через:

```
result.ok === false
```

`try/catch` потребуется, например, если сам `fetch` не смог выполнить сетевой запрос и выбросил исключение.

---

# 14\. Общий шаблон API-метода

В большинстве случаев новый метод можно создать по следующему шаблону:

```
export class APIMethodExample
extends APIMethodBase<
    APIMethodDataResponse<ResponseType>
> {

async execute(
    request: RequestType,
): Promise<
    APIMethodDataResponse<ResponseType>
> {

    return this.request(
        ENDPOINT,
        {
            method: "POST",
            body: request,
        },
    );
}

protected createResponse(
    response: Response,
    data: unknown,
): APIMethodDataResponse<ResponseType> {

    if (!response.ok) {
        return new APIMethodDataResponse<ResponseType>(
            response,
            undefined,
            this.createError(
                response,
                data,
            ),
        );
    }

    return new APIMethodDataResponse(
        response,
        data as ResponseType,
    );
}
}
```

Для `GET` без body:

```
return this.request(
ENDPOINT,
);
```

Для `GET` с параметром:

```
return this.request(
ENDPOINT(id),
);
```

Для `POST` / `PUT` / `PATCH`:

```
return this.request(
ENDPOINT,
{
    method: "POST",
    body: request,
},
);
```

Для `DELETE`:

```
return this.request(
ENDPOINT(id),
{
    method: "DELETE",
},
);
```

---

# 15\. Рекомендации

При добавлении нового endpoint желательно придерживаться следующих правил:

- **Endpoint хранить в `endpoints.ts`**, а не писать URL непосредственно в `execute()`.
- **Request и Response описывать отдельными TypeScript-типами**, если у них есть структура.
- **Один API-метод — один класс** с понятным названием `APIMethod...`.
- **Выполнение запроса делать через `execute()`**.
- **Все HTTP-запросы выполнять через `this.request()`**, а не напрямую через `fetch`.
- **Для возвращаемых данных использовать `APIMethodDataResponse<T>`**.
- **Для ответов без данных использовать класс, наследующий `APIMethodResponseBase`**.
- **Запросы группировать по доменам**: `auth`, `users`, `orders` и т. д.
- **Экспортировать публичные методы через `index.ts`**.

---

# 16\. Добавление нового запроса — кратко

Если нужно добавить новый endpoint, достаточно выполнить следующие шаги:

```
1. Добавить URL в endpoints.ts
        ↓
2. Описать Request / Response types
        ↓
3. Создать APIMethod...
        ↓
4. Реализовать execute()
        ↓
5. Реализовать createResponse()
        ↓
6. Добавить export в index.ts
```

Основной паттерн библиотеки:

```
Endpoint
↓
API Method
↓
APIMethodBase.request()
↓
fetch()
↓
createResponse()
↓
Typed Response
```

Например:

```
POST /users
    │
    ▼
USERS_ENDPOINTS.create
    │
    ▼
APIMethodCreateUser.execute()
    │
    ▼
this.request(...)
    │
    ▼
fetch(...)
    │
    ▼
createResponse(...)
    │
    ▼
APIMethodDataResponse<User>
```