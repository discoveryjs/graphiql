const fs = require('fs');
const express = require('express');
const ejs = require('ejs');

const {
    TITLE = 'GraphiQL',
    GRAPHQL_ENDPOINT
} = process.env;

const app = express();

app.use(express.static('dist'));

const template = fs.readFileSync('./src/index.html').toString();
const html = template
    .replace('%TITLE%', TITLE)
    .replace('%GRAPHQL_ENDPOINT%', GRAPHQL_ENDPOINT);

app.get('/', (req, res) => {
    res.send(html);
});

app.listen(3000);