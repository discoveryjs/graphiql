import { App as DiscoveryApp, Widget, router } from '@discoveryjs/discovery/dist/discovery';
import { encodeParams, decodeParams } from '@discoveryjs/discovery/src/pages/report/params';

export function createDiscoveryInstance(options) {
    const { darkmode, styles } = options || {};
    const instance = new Widget(null, 'main', {
        defaultPageId: 'main',
        darkmode: darkmode || 'auto',
        darkmodePersistent: true,
        styles: styles || [{ type: 'link', href: 'create-discovery-instance.css' }]
    });

    instance.dom.container.append(
        instance.dom.loadingOverlay = document.createElement('div')
    );
    instance.dom.loadingOverlay.className = 'loading-overlay done';

    instance.darkmode.subscribe(dark => document.body.classList.toggle('discovery-root-darkmode', dark), true);

    instance.progressbar = DiscoveryApp.prototype.progressbar;
    instance.loadDataFromUrl = DiscoveryApp.prototype.loadDataFromUrl;
    instance.trackLoadDataProgress = DiscoveryApp.prototype.trackLoadDataProgress;

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
        onClick: () => instance.setPage(instance.defaultPageId)
    });

    instance.nav.append({
        when: () => instance.pageId !== instance.reportPageId,
        content: 'text:"Make report"',
        onClick: () => instance.setPage(instance.reportPageId)
    });

    let detachToggleDarkMode = () => {};
    instance.nav.menu.append({
        view: 'block',
        className: ['toggle-menu-item', 'dark-mode-switcher'],
        name: 'dark-mode',
        when: '#.widget | darkmode.mode != "disabled"',
        postRender: (el, opts, data, { hide }) => {
            let selfValue;

            detachToggleDarkMode();
            detachToggleDarkMode = instance.darkmode.subscribe((value, mode) => {
                const newValue = mode === 'auto' ? 'auto' : value;

                if (newValue === selfValue) {
                    return;
                }

                el.innerHTML = '';
                selfValue = newValue;
                instance.view.render(el, {
                    view: 'toggle-group',
                    beforeToggles: 'text:"Color schema"',
                    onChange: value => {
                        selfValue = value;
                        instance.darkmode.set(value);
                        hide();
                    },
                    value: newValue,
                    data: [
                        { value: false, text: 'Light' },
                        { value: true, text: 'Dark' },
                        { value: 'auto', text: 'Auto' }
                    ]
                }, null, { widget: instance });
            }, true);
        }
    });

    return instance;
}
