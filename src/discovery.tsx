import React from 'react';
// @ts-ignore
import { Widget, router } from '@discoveryjs/discovery';
import { encodeParams, decodeParams } from '@discoveryjs/discovery/src/pages/report/params';

type DiscoveryProps = {
    value: any
    query: string
    variables: string
    initQuery: (query: string, variables: string) => void
    styles: string
    darkmode: any
}

export class Discovery extends React.Component<DiscoveryProps> {
    discovery: any;
    ref: any;

    constructor(props: DiscoveryProps) {
        super(props);

        this.discovery = null;
        this.ref = React.createRef();
    }

    componentDidMount() {
        const { initQuery, styles, darkmode } = this.props;

        this.discovery = new Widget(
            this.ref.current, 'main', {
                defaultPageId: 'main',
                darkmode: darkmode ? darkmode.value : false,
                styles: [{ type: 'link', href: styles }]
            }
        );

        if (darkmode) {
            darkmode.subscribe(value => {
                this.discovery.darkmode.set(value);
            })
        }

        this.discovery.apply(router);

        this.discovery.page.define('main', [
            {
                view: 'struct',
                expanded: 3
            }
        ], {
            encodeParams,
            decodeParams
        });

        this.discovery.nav.append({
            when: () => this.discovery.pageId !== this.discovery.defaultPageId,
            content: 'text:"Index"',
            onClick: () => this.discovery.setPage(this.discovery.defaultPageId, null, {
                'gql-b64': this.props.query || '',
                'vars-b64': this.props.variables || ''
            })
        });

        this.discovery.nav.append({
            when: () => this.discovery.pageId !== 'report',
            content: 'text:"Make report"',
            onClick: () => this.discovery.setPage('report', null, {
                'gql-b64': this.props.query || '',
                'vars-b64': this.props.variables || ''
            })
        });

        this.ref.current.style.display = 'none';

        this.discovery.dom.ready.then(() => {
            this.ref.current.style.display = '';
        });

        const { pageParams } = this.discovery;

        if (pageParams['gql-b64'] || pageParams['vars-b64']) {
            initQuery(pageParams['gql-b64'] || '', pageParams['vars-b64'] || '');
        }
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.value !== nextProps.value) {
            return true;
        }
        if (this.props.query !== nextProps.query) {
            return true;
        }
        if (this.props.variables !== nextProps.variables) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        this.discovery.setPageParams({
            ...this.discovery.pageParams,
            'gql-b64': this.props.query || '',
            'vars-b64': this.props.variables || ''
        })

        let data = null;

        try {
            data = JSON.parse(this.props.value);
        } catch(_) {}

        if (data) {
            this.discovery.setData(data);
        }
    }

    render() {
        return <div ref={this.ref} className={`discovery-root ${this.props.value ? '' : ' hidden'}`}></div>
    }
}
