import { App as DiscoveryApp, Widget, router } from '@discoveryjs/discovery/dist/discovery';
import { encodeParams, decodeParams } from '@discoveryjs/discovery/src/pages/report/params';

export function createDiscoveryInstance(options) {
    const { darkmode, styles } = options || {};
    const instance = new Widget(null, 'main', {
        defaultPageId: 'main',
        darkmode: darkmode || false,
        styles: [{ type: 'link', href: 'create-discovery-instance.css' }]
    });

    instance.dom.container.append(
        instance.dom.loadingOverlay = document.createElement('div')
    );
    instance.dom.loadingOverlay.className = 'loading-overlay done';

    instance.progressbar = DiscoveryApp.prototype.progressbar;
    instance.loadDataFromUrl = DiscoveryApp.prototype.loadDataFromUrl;
    instance.trackLoadDataProgress = DiscoveryApp.prototype.trackLoadDataProgress;

    if (darkmode) {
        darkmode.subscribe(value => instance.darkmode.set(value));
    }

    instance.apply(router);
    instance.page.define('main', [
        {
            view: 'alert',
            when: 'no $',
            content: 'text:"Enter query"'
        },
        {
            view: 'struct',
            when: '$',
            expanded: 3
        }
    ], {
        encodeParams,
        decodeParams
    });

    instance.nav.append({
        when: () => instance.pageId !== instance.defaultPageId,
        content: 'text:"Index"',
        onClick: () => instance.setPage(instance.defaultPageId, null, {
            'gql-b64': instance.pageParams['gql-b64'] || '',
            'vars-b64': instance.pageParams['vars-b64'] || '',
        })
    });

    instance.nav.append({
        when: () => instance.pageId !== instance.reportPageId,
        content: 'text:"Make report"',
        onClick: () => instance.setPage(instance.reportPageId, null, {
            'gql-b64': instance.pageParams['gql-b64'] || '',
            'vars-b64': instance.pageParams['vars-b64'] || '',
        })
    });

    return instance;
}
