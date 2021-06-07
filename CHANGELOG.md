## 1.4.1 (07-06-2021)

- Removed debounce when editing the query

## 1.4.0 (14-05-2021)

- New option `endpointHeaders` that allows to specify additional headers for GraphQL requests
- New option `extraToolbarItems` for extending GraphiQL toolbar with additional components
- New option `logoUrl` which you can use to show your logo in the toolbar
- Exported `React`, `ReactDOM`, `App`, `GraphiQL` from main bundle for better customization 

## 1.3.0 (19-03-2021)

- Added dark mode
- Removed extra `.graphiql-container` wrapper element
- Added explorer open state saving to localStorage
- Added a resizer for explorer and tweaked resizer's appearance
- Changed main exposing function to `createGraphiqlApp(endpoint, discovery, options)`; `options` is supported `rootEl` and `title` options for now
- Fixed overscroll in Explorer when `Shift-Alt-LeftClick` is used

## 1.2.0 (10-03-2021)

- Changed `graphiqlApp` to expose `App` instance (result of top level render)

## 1.1.0 (10-03-2021)

- Reworked build scripts
- Removed CommonJS bundle
- Splitted into 2 modules: graphiql itself and create discovery instance module
- Various fixes and improvements on integration graphiql<->discoveryjs

## 1.0.0

- Initial Release
