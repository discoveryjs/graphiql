import React from 'react';

type DiscoveryProps = {
    discovery: any
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
        this.props.discovery.setContainer(this.ref.current);

        this.ref.current.style.display = 'none';

        this.props.discovery.dom.ready.then(() => {
            this.ref.current.style.display = '';
        });
    }

    render() {
        return <div ref={this.ref} className='discovery-root' />
    }
}
