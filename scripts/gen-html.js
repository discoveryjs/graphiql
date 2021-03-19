const path = require('path');
const fs = require('fs');
const {
    TITLE = 'GraphiQL',
    GRAPHQL_ENDPOINT = ''
} = process.env;

module.exports = function() {
    const template = fs.readFileSync(path.join(__dirname, '../src/index.html'), 'utf8');
    return template
        .replace(/%TITLE%/g, TITLE)
        .replace(/%GRAPHQL_ENDPOINT%/g, GRAPHQL_ENDPOINT);
};

if (require.main === module) {
    console.log(module.exports());
}
