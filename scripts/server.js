const path = require('path');
const genHtml = require('./gen-html');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, '../dist')));
app.get('/', (req, res) => {
    res.send(genHtml());
});

app.listen(3000);
