const fs = require('fs');
const express = require('express');
const ejs = require('ejs');

const {
    TITLE,
    GRAPHQL_ENDPOINT
} = process.env;

const app = express();

app.use(express.static('dist'));

const template = fs.readFileSync('./src/index.html.ejs').toString();
const html = ejs.render(template, {
    TITLE,
    GRAPHQL_ENDPOINT
});

app.get('/', (req, res) => {
    res.send(html);
});

app.listen(3000);