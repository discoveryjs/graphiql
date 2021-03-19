import React, { Component } from 'react';
import { render } from 'react-dom';
import { GraphiQL } from './graphiql';
import { buildClientSchema, getIntrospectionQuery, parse } from 'graphql';
import * as base64 from '@discoveryjs/discovery/src/core/utils/base64';

const getFetcher = (endpoint: string) => (params: any) => {
    return fetch(
        endpoint,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }
    )
        .then(function (response) {
            return response.text();
        })
        .then(function (responseBody) {
            try {
                return JSON.parse(responseBody);
            } catch (e) {
                return responseBody;
            }
        });
};

export type AppProps = {
    endpoint: string;
    discovery: any;
    title?: string;
};

export type AppState = {
    schema: any,
    query?: string;
    variables?: string;
    dzen: boolean;
    darkmode: boolean;
    explorerIsOpen: boolean;
};

class App extends Component<AppProps, AppState> {
    endpoint: string;
    discovery: any;
    _graphiql: any;

    constructor(props: AppProps) {
        super(props);

        const { endpoint, discovery } = props;
        this.endpoint = endpoint;
        this.discovery = discovery;

        this.state = {
            schema: null,
            query: this.getDiscoveryParam('gql-query'),
            variables: this.getDiscoveryParam('gql-vars') || '',
            dzen: this.discovery.pageParams.dzen || false,
            darkmode: this.discovery.darkmode.value,
            explorerIsOpen: true
        };

        this.discovery.darkmode.subscribe((darkmode: boolean) => this.setState({ darkmode }));
        this.discovery.setPageHash = function (hash: string, replace: boolean) {
            const { pageId, pageRef, pageParams } = this.decodePageHash(hash);
            return discovery.constructor.prototype.setPageHash.call(
                this,
                this.encodePageHash(pageId, pageRef, {
                    ...'gql-query' in this.pageParams ? { 'gql-query': this.pageParams['gql-query'] } : null,
                    ...'gql-vars' in this.pageParams ? { 'gql-vars': this.pageParams['gql-vars'] } : null,
                    ...pageParams
                }),
                replace || hash === location.hash
            );
        };
        this.discovery.on('pageHashChange', () => {
            this.setState({ dzen: this.discovery.pageParams.dzen || false });
        });

        if (this.state.query) {
            this.getDataFetcher(endpoint)({
                query: this.state.query,
                variables: this.state.variables || null
            });

            if (this.discovery.pageParams.dzen) {
                this.discovery.dom.container.dataset.dzen = true;
            }
        } else {
            this.discovery.renderPage();
        }
    }

    getDiscoveryParam(name: string) {
        return base64.decode(this.discovery.pageParams[name] || '');
    }

    componentDidMount() {
        getFetcher(this.endpoint)({
            query: getIntrospectionQuery()
        }).then(result => {
            const editor = this._graphiql.getQueryEditor();
            editor.setOption('extraKeys', {
                ...(editor.options.extraKeys || {}),
                'Shift-Alt-LeftClick': this._handleInspectOperation
            });

            this.setState({ schema: buildClientSchema(result.data) });
            this._graphiql.refresh();
        });
    }

    _handleInspectOperation = (
        cm: any,
        mousePos: any
    ) => {
        const parsedQuery = parse(this.state.query || '');

        if (!parsedQuery) {
            console.error('Couldn\'t parse query document');
            return null;
        }

        const token = cm.getTokenAt(mousePos);
        const start = { line: mousePos.line, ch: token.start };
        const end = { line: mousePos.line, ch: token.end };
        const relevantMousePos = {
            start: cm.indexFromPos(start),
            end: cm.indexFromPos(end)
        };

        const position = relevantMousePos;

        const def = parsedQuery.definitions.find(definition => {
            if (!definition.loc) {
                console.log('Missing location information for definition');
                return false;
            }

            const { start, end } = definition.loc;
            return start <= position.start && end >= position.end;
        });

        if (!def) {
            console.error(
                'Unable to find definition corresponding to mouse position'
            );
            return null;
        }

        const operationKind =
            def.kind === 'OperationDefinition'
                ? def.operation
                : def.kind === 'FragmentDefinition'
                    ? 'fragment'
                    : 'unknown';

        const operationName =
            def.kind === 'OperationDefinition' && Boolean(def.name)
                ? def.name && def.name.value
                : def.kind === 'FragmentDefinition' && Boolean(def.name)
                    ? def.name.value
                    : 'unknown';

        const selector = `.graphiql-explorer-root #${operationKind}-${operationName}`;

        const el = document.querySelector(selector);
        el && el.scrollIntoView();
    };

    _handleEditQuery = (query?: string) => {
        this.setState({ query }, () => {
            this.discovery.setPageParams({
                ...this.discovery.pageParams,
                'gql-query': base64.encode(this.state.query || '')
            }, true);
        });
    }

    _handleEditVariables = (variables: string) => {
        this.setState({ variables }, () => {
            this.discovery.setPageParams({
                ...this.discovery.pageParams,
                'gql-vars': base64.encode(this.state.variables || '')
            }, true);
        });
    }

    getDataFetcher = (endpoint: string) => (params: any) => {
        return this.discovery.loadDataFromUrl(
            endpoint,
            'data',
            {
                fetch: {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(params)
                },
                validateData: (res: any) => {
                    if (res.errors) {
                        throw new Error(JSON.stringify(res.errors));
                    }
                }
            }
        );
    }

    render() {
        const { query, variables, schema, dzen, darkmode } = this.state;

        return (
            <GraphiQL
                ref={ref => this._graphiql = ref}
                fetcher={this.getDataFetcher(this.endpoint)}
                schema={schema}
                query={query}
                variables={variables}
                onEditQuery={this._handleEditQuery}
                onEditVariables={this._handleEditVariables}
                discovery={this.discovery}
                dzen={dzen}
                darkmode={darkmode}
            >
                {this.props.title ? <GraphiQL.Logo>{this.props.title}</GraphiQL.Logo> : null}
                <GraphiQL.Toolbar>
                    <GraphiQL.Button
                        onClick={() => this._graphiql.handlePrettifyQuery()}
                        label='Prettify'
                        title='Prettify Query (Shift-Ctrl-P)'
                    />
                    <GraphiQL.Button
                        onClick={() => this._graphiql.handleToggleHistory()}
                        label='History'
                        title='Show History'
                    />
                    <GraphiQL.Button
                        onClick={() => this._graphiql.handleToggleExplorer()}
                        label='Explorer'
                        title='Toggle Explorer'
                    />
                </GraphiQL.Toolbar>
            </GraphiQL>
        );
    }
}

type Options = {
    title?: string;
    rootEl?: Element;
};

export function graphiqlApp(endpoint: string, discovery?: Object, opts?: Options) {
    const { title, rootEl } = opts || {};
    return render(
        <App endpoint={endpoint} discovery={discovery} title={title} />,
        rootEl || document.getElementById('root')
    );
}
