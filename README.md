## GraphiQL with Discovery.js as result viewer

### Docker

Pull image and run it with `TITLE` and `GRAPHQL_ENDPOINT` env variables

```bash
docker pull discoveryjs/graphiql
docker run -p 3000:3000 -e GRAPHQL_ENDPOINT=https://your.endpoint/graphql -e TITLE="Some title" discoveryjs/graphiql
```
