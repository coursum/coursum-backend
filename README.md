# coursum-backend

A server that provide API to search course data.

## Setup

## Initialization
```shell
$ yarn # Install dependencies
$ yarn build ## Compile TypeScript
$ cp .env.template .env # Copy env template AND PLEASE FILL IN .ENV
$ # Prepare course data in database/syllabus-json-files
$ # Might have some other more steps but I forget, sorry.
```

### Development
```shell
$ docker-compose up -d # Setup Elasticsearch and Libana in develepment environment
$ make init # Index course data
$ yarn dev # Start server in develepment environment
```

### Production
```shell
$ docker compose -f docker-compose.yml -f docker-compose.production.yml up -d # Setup Elasticsearch and Kibana in production environment
$ make init # Index course data
$ yarn start # Start server in production environment
```

## API

| Endpoint | Method | Description                                             |
| -------- | ------ | ------------------------------------------------------- |
| /        | GET    | show welcome messsage                                   |
| /ping    | GET    | for ping test                                           |
| /count   | GET    | get document count for all indices                      |
| /search  | GET    | search and response course json with given query string |
