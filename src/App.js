import React, {Component} from 'react';
import './shared/App.css'
import SwitchComponents from './shared/components/SwitchComponent';
import DefaultLoginView from "./shared/views/DefaultLoginView";
import RegistrationView from "./shared/views/RegistrationView";
import LocalLoginView from "./shared/views/LocalLoginView";
import PasswordsListView from "./shared/views/PasswordListView";
import ViewType from "./shared/other/ViewType"
import LocalRegistrationView from "./shared/views/LocalRegistrationView";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeView: null,
        }
    }

    render() {
        return (
            <div className="App">
                <SwitchComponents active={this.state.activeView}>
                    <DefaultLoginView componentName={ViewType.defaultLoginView}
                                      changeParentsActiveView={this.changeActiveView}/>
                    <LocalLoginView componentName={ViewType.localLoginView}
                                    changeParentsActiveView={this.changeActiveView}/>
                    <LocalRegistrationView componentName={ViewType.localRegistrationView}
                                           changeParentsActiveView={this.changeActiveView}/>
                    <RegistrationView componentName={ViewType.registrationView}
                                      changeParentsActiveView={this.changeActiveView}/>
                    <PasswordsListView componentName={ViewType.passwordListView}
                                       changeParentsActiveView={this.changeActiveView}/>
                </SwitchComponents>
            </div>
        );
    }

    componentDidMount() {
        window.electron.getDefaultView().then((response) => {
            return this.setState({activeView: response.defaultView})
        });
    }

    changeActiveView = (newActiveView) => {
        this.setState({activeView: newActiveView});
    }
}

export default App;
