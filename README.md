# vendo API

RESTful API server for the Vendo Application

## System Requirements

1. Node (v15.0.1)
2. Docker

## Setup

1. Clone the respository
2. Install dependencies using `npm install`
3. Create a `.env` file based on the example `.example.env` file:

```
$ cp .example.env .env
```

#### Build

```
$ docker build . -t vendo-api:latest
```

#### Run

```
$ docker run -p 8080:8000 --env DATABASE_URL=[[POSTGRESQL_DB_URI_STRING]] -d vendo-api:latest
```

#### Development

1. Start the development PostgreSQL instance on docker

```
$ docker-compose -f docker-compose.dev-pg.yml up -d
```

2, Start the development mode:

```
$ npm run dev
```

### Test

1. Spin up a test DB container

```
$ docker compose -f docker-compose.test-pg.yml up -d
```

2. Create the DB:

```
$ npx dotenv -e .env.test -- prisma migrate dev --name init
```

3. Start the test

```
$ npm run test
```
