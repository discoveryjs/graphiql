## GraphiQL Docker app

Pull image and run it with `TITLE` and `GRAPHQL_ENDPOINT` env variables

```bash
docker pull exdis/graphiql
docker run -p 3000:3000 -e GRAPHQL_ENDPOINT=https://your.endpoint/graphql -e TITLE="Some title" exdis/graphiql
```
