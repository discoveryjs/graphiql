import React, { Component } from 'react';
import { render } from 'react-dom';
import { GraphiQL } from './graphiql';
import GraphiQLExplorer from 'graphiql-explorer';
import { buildClientSchema, getIntrospectionQuery, parse } from 'graphql';
import { makeDefaultArg, getDefaultScalarArgValue } from './custom-args';
import * as base64 from '@discoveryjs/discovery/src/core/utils/base64';

const getFetcher = endpoint => params => {
  return fetch(
    endpoint,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    }
  )
    .then(function(response) {
      return response.text();
    })
    .then(function(responseBody) {
      try {
        return JSON.parse(responseBody);
      } catch (e) {
        return responseBody;
      }
    });
}

class App extends Component {
  constructor(props) {
    super(props);

    const { endpoint, discovery } = props;
    this.endpoint = endpoint;
    this.discovery = discovery;

    this.state = {
      schema: null,
      query: this.getDiscoveryParam('gql-query'),
      variables: this.getDiscoveryParam('gql-vars') || '',
      dzen: this.discovery.pageParams['dzen'] || false,
      explorerIsOpen: true
    };

    discovery.setPageHash = function(hash, replace) {
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

    this.discovery.on('pageHashChange', () => {
      this.setState({ dzen: this.discovery.pageParams.dzen || false })
    });
  }

  getDiscoveryParam(name) {
    return base64.decode(this.discovery.pageParams[name] || '');
  }

  componentDidMount() {
    getFetcher(this.endpoint)({
      query: getIntrospectionQuery()
    }).then(result => {
      const editor = this._graphiql.getQueryEditor();
      editor.setOption("extraKeys", {
        ...(editor.options.extraKeys || {}),
        "Shift-Alt-LeftClick": this._handleInspectOperation
      });
      editor.refresh();

      this.setState({ schema: buildClientSchema(result.data) });
    });
  }

  _handleInspectOperation = (
    cm,
    mousePos
  ) => {
    const parsedQuery = parse(this.state.query || "");

    if (!parsedQuery) {
      console.error("Couldn't parse query document");
      return null;
    }

    var token = cm.getTokenAt(mousePos);
    var start = { line: mousePos.line, ch: token.start };
    var end = { line: mousePos.line, ch: token.end };
    var relevantMousePos = {
      start: cm.indexFromPos(start),
      end: cm.indexFromPos(end)
    };

    var position = relevantMousePos;

    var def = parsedQuery.definitions.find(definition => {
      if (!definition.loc) {
        console.log("Missing location information for definition");
        return false;
      }

      const { start, end } = definition.loc;
      return start <= position.start && end >= position.end;
    });

    if (!def) {
      console.error(
        "Unable to find definition corresponding to mouse position"
      );
      return null;
    }

    var operationKind =
      def.kind === "OperationDefinition"
        ? def.operation
        : def.kind === "FragmentDefinition"
        ? "fragment"
        : "unknown";

    var operationName =
      def.kind === "OperationDefinition" && !!def.name
        ? def.name.value
        : def.kind === "FragmentDefinition" && !!def.name
        ? def.name.value
        : "unknown";

    var selector = `.graphiql-explorer-root #${operationKind}-${operationName}`;

    var el = document.querySelector(selector);
    el && el.scrollIntoView();
  };

  _handleEditQuery = (query) => {
    this.setState({ query }, () => {
      this.discovery.setPageParams({
        ...this.discovery.pageParams,
        'gql-query': base64.encode(this.state.query || ''),
      }, true)
    });
  }

  _handleEditVariables = (variables) => {
    this.setState({ variables }, () => {
      this.discovery.setPageParams({
        ...this.discovery.pageParams,
        'gql-vars': base64.encode(this.state.variables || '')
      }, true)
    });
  }

  _handleToggleExplorer = () => {
    this.setState({ explorerIsOpen: !this.state.explorerIsOpen });
  };

  getDataFetcher = (endpoint) => (params) => {
    return this.discovery.loadDataFromUrl(
      endpoint,
      'data',
      {
        fetch: {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(params)
        },
        validateData: res => {
          if (res.errors) {
            throw new Error(JSON.stringify(res.errors));
          }
        }
      }
    )
  }

  render() {
    const { query, variables, schema, dzen } = this.state;

    return (
      <div className={`graphiql-container ${dzen ? 'dzen' : ''}`}>
        <GraphiQLExplorer
          schema={schema}
          query={query}
          onEdit={this._handleEditQuery}
          onRunOperation={operationName =>
            this._graphiql.handleRunQuery(operationName)
          }
          explorerIsOpen={this.state.explorerIsOpen}
          onToggleExplorer={this._handleToggleExplorer}
          getDefaultScalarArgValue={getDefaultScalarArgValue}
          makeDefaultArg={makeDefaultArg}
        />
        <GraphiQL
          ref={ref => (this._graphiql = ref)}
          fetcher={this.getDataFetcher(this.endpoint)}
          schema={schema}
          query={query}
          variables={variables}
          onEditQuery={this._handleEditQuery}
          onEditVariables={this._handleEditVariables}
          discovery={this.discovery}
        >
          <GraphiQL.Toolbar>
            <GraphiQL.Button
              onClick={() => this._graphiql.handlePrettifyQuery()}
              label="Prettify"
              title="Prettify Query (Shift-Ctrl-P)"
            />
            <GraphiQL.Button
              onClick={() => this._graphiql.handleToggleHistory()}
              label="History"
              title="Show History"
            />
            <GraphiQL.Button
              onClick={this._handleToggleExplorer}
              label="Explorer"
              title="Toggle Explorer"
            />
          </GraphiQL.Toolbar>
        </GraphiQL>
      </div>
    );
  }
}

export function graphiqlApp(endpoint, discovery, elem) {
  render(
    <App endpoint={endpoint} discovery={discovery} />,
    elem || document.getElementById('root')
  );
}
