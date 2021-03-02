import React from 'react';
// @ts-ignore
import { Widget, router } from '@discoveryjs/discovery';
import { encodeParams, decodeParams } from '@discoveryjs/discovery/src/pages/report/params';

type DiscoveryProps = {
    value: any
    query: string
    variables: string
    initQuery: (query: string, variables: string) => void
}

export class Discovery extends React.Component<DiscoveryProps> {
    discovery: any;

    constructor(props: DiscoveryProps) {
        super(props);

        this.discovery = null;
    }

    componentDidMount() {
        const rootNode = document.querySelector('.discovery-root');

        this.discovery = new Widget(
            rootNode, null, {
                styles: [{ type: 'link', href: 'discovery.css' }]
            }
        );

        this.discovery.apply(router);

        this.discovery.page.define('default', [
            {
                view: 'struct',
                expanded: 3
            }
        ], {
            encodeParams,
            decodeParams
        });

        this.discovery.nav.append({
            when: () => this.discovery.pageId !== 'default',
            content: 'text:"Index"',
            onClick: () => {
                this.discovery.setPage('default', null, {
                    'gql-b64': this.props.query || '',
                    'vars-b64': this.props.variables || ''
                })
            }
        });

        this.discovery.nav.append({
            when: () => this.discovery.pageId !== 'report',
            content: 'text:"Make report"',
            onClick: () => this.discovery.setPage('report', null, {
                'gql-b64': this.props.query || '',
                'vars-b64': this.props.variables || ''
            })
        });

        const { pageParams } = this.discovery;

        if (pageParams['gql-b64'] || pageParams['vars-b64']) {
            this.props.initQuery(pageParams['gql-b64'] || '', pageParams['vars-b64'] || '');
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
        return <div className={`discovery-root ${this.props.value ? '' : ' hidden'}`}></div>
    }
}
