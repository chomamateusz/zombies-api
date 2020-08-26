# Zombies API

## Usage

Start the project with `npm run dev` command.
After starting, open the http://localhost:3000/ URL in your browser.

## Endpoints

All endpoints receive and outputs data by JSON.

### `POST /api/zombies`

Create zombie.

Example body:

```json
{
    "name": "Zombie 1"
}
```

Parameters:

- `name: string` - [REQUIRED] The name of the zombie.

Example response body:

```json
{
    "_id": "T4hOEew89wP5XxPj",
    "name": "Zombie 1",
    "createdAt": "2020-08-26T13:15:57.324Z"
}
```

### `GET /api/zombies`

List of all zombies

Example response body:

```json
{
    "rows": [
        {
            "_id": "T4hOEew89wP5XxPj",
            "name": "Zombie 1",
            "createdAt": "2020-08-26T13:15:57.324Z"
        }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
}
```

### `GET /api/zombies/:zombieId`

Get single zombie.

Example response body:

```json
{
    "_id": "T4hOEew89wP5XxPj",
    "name": "Zombie 1",
    "createdAt": "2020-08-26T13:15:57.324Z"
}
```

### `PUT /api/zombies/:zombieId`

Update single zombie.

Example body:

```json
{
    "name": "Zombie 2.0"
}
```

Parameters:

- `name: string` - [REQUIRED] The name of the zombie.

Example response body:

```json
{
    "_id": "T4hOEew89wP5XxPj",
    "name": "Zombie 2.0",
    "createdAt": "2020-08-26T13:15:57.324Z"
}
```

### `DELETE /api/zombies/:zombieId`

Delete single zombie.

Example response body:

```json
1
```

### `GET /api/zombies/:zombieId/items`

Get all items of a zombie with calculated prices in 3 currencies.

Example response body:

```json
{
    "rows": [
        {
            "_id": "e4cZwPUjZzv11S4X",
            "zombieId": "ghJ5wq5ZBZVHXQFh",
            "itemId": "1",
            "createdAt": "2020-08-26T13:58:02.019Z",
            "id": 1,
            "name": "Diamond Sword",
            "price": 100
        },
        {
            "_id": "JyBaiLOv4xDE2hlG",
            "zombieId": "ghJ5wq5ZBZVHXQFh",
            "itemId": "1",
            "createdAt": "2020-08-26T13:57:52.831Z",
            "id": 1,
            "name": "Diamond Sword",
            "price": 100
        }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1,
    "pricesTotal": {
        "EUR": 887.36,
        "USD": 750.02,
        "PLN": 200
    }
}
```

### `GET /api/zombies/:zombieId/items/:itemId`

Get specific item that belongs to specific zombie (selected by `zombieId` in query).

Example response:

```json
{
    "_id": "e4cZwPUjZzv11S4X",
    "zombieId": "ghJ5wq5ZBZVHXQFh",
    "itemId": "1",
    "createdAt": "2020-08-26T13:58:02.019Z",
    "id": 1,
    "name": "Diamond Sword",
    "price": 100,
    "pricesTotal": {
        "EUR": 443.68,
        "USD": 375.01,
        "PLN": 100
    }
}
```

### `POST /api/zombies/:zombieId/items`

Create new item on a specific (selected by `zombieId` in query).

Example body:

```json
{
    "itemId": "1"
}
```

Parameters:

- `itemId: string` - [REQUIRED] Item id from https://zombie-items-api.herokuapp.com/api/items.

Example response body:

```json
{
    "rows": [
        {
            "_id": "e4cZwPUjZzv11S4X",
            "zombieId": "ghJ5wq5ZBZVHXQFh",
            "itemId": "1",
            "createdAt": "2020-08-26T13:58:02.019Z",
            "id": 1,
            "name": "Diamond Sword"
        }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1,
    "pricesTotal": {
        "EUR": 443.68,
        "USD": 375.01,
        "PLN": 100
    }
}
```

### `PUT /api/zombies/:zombieId/items/:itemId`

Update specific item (selected by `itemId` in query) in specific zombie (selected by `zombieId` in query).

Example body:

```json
{
    "itemId": "3"
}
```

Parameters:

- `itemId: string` - [REQUIRED] Item id from https://zombie-items-api.herokuapp.com/api/items.

Example response body:

```json
{
    "_id": "xHLtM5WkLNihGw5K",
    "zombieId": "fzYpdCOU5qUMJfJV",
    "itemId": "3",
    "createdAt": "2020-08-26T14:05:22.844Z"
}
```

### `DELETE /api/zombies/:zombieId/items/:itemId`

Delete specific item (selected by `itemId` in query) in specific zombie (selected by `zombieId` in query).

Example response body:

```json
1
```

## Services

- **api**: API Gateway services
- **items**: HTTP service to obtain and cache items from https://zombie-items-api.herokuapp.com/api/items.
- **rates**: HTTP service to obtain and cache rates from http://api.nbp.pl/api/exchangerates/tables/C/today/.
- **zombies**: CRUD database service for zombies, fully available via API.
- **zombie-items**: CRUD database service for zombie items, not available via API.
- **zombie-items-middleware**: Middleware service for zombie items to transform data and requests for `zombie-items`, not available via API.

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose

## Moleculer

[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

This is a [Moleculer](https://moleculer.services/)-based microservices project. Generated with the [Moleculer CLI](https://moleculer.services/docs/0.14/moleculer-cli.html).
