const fs = require('fs');
const csstree = require('css-tree');

const css = fs.readFileSync(__dirname + '/../dist/index.css');
const ast = csstree.parse(css);

// clean up CSS hacks for IE7 (*property) that's coming from graphiql,
// since esbuild warn on such kind of hacks
csstree.walk(ast, {
    enter(node, item, list) {
        if (node.type === 'Declaration' && csstree.property(node.property).hack) {
            list.remove(item);
        }
    }
});

fs.writeFileSync(__dirname + '/../dist/index.css', csstree.generate(ast));
