### Redis:

Run `docker run -d --name redis-server -e REDIS_PASSWORD=yourpassword -p 6379:6379 redis:latest redis-server --requirepass yourpassword`

### Playwright:

`yarn playwright install`

### Usage:

First: Use GET `datasets/sync` to synchronize datasets into db

Second: use GET `sanctions/sync` to synchronize sanctions into db
