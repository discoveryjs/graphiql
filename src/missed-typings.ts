declare module '@discoveryjs/discovery/src/core/utils/base64' {
    function encode(input: string): string;
    function decode(input: string): string;
}

declare module 'graphiql-explorer' {
    import * as React from 'react';

    type GraphiQLExplorerProps = {
        schema?: any;
        query?: string
        onEdit?: () => void;
        onRunOperation?: (operationName: string) => void;
        explorerIsOpen?: boolean;
        onToggleExplorer?: Function;
        getDefaultScalarArgValue?: Function;
        makeDefaultArg?: Function;
    }

    export default class GraphiQLExplorer extends React.Component<GraphiQLExplorerProps, any> {
        constructor(props: GraphiQLExplorerProps);
    }
}
