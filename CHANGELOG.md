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
