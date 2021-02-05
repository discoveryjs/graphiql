const fs = require('fs');
const csstree = require('css-tree');

const css = fs.readFileSync('node_modules/graphiql/graphiql.css');

const ast = csstree.parse(css);

csstree.walk(ast, {
    enter(node, item, list) {
        if (node.type === 'Declaration' && csstree.property(node.property).hack) {
            list.remove(item);
        }
    }
});

fs.writeFileSync('dist/index.css', csstree.generate(ast));
