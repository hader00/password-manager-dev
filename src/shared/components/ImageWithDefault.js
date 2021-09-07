import React from "react";

export default class ImageWithDefault extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            failed: false
        };
    }
    _onError = () => {
        this.setState({ failed: true });
    }
    render() {
        const defaultImage = <img src={this.props.default} style={this.props.style}  alt={""}/>;

        if (this.state.failed) return defaultImage;

        return (
            <img
                {...this.props}
                onError={this._onError}
                alt={""}/>
        );
    }
}