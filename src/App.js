import React, {Component} from 'react';
import './App.css'
import SwitchComponents from './components/SwitchComponent';
import DefaultLoginView from "./views/DefaultLoginView";
import RegistrationView from "./views/RegistrationView";
import LocalLoginView from "./views/LocalLoginView";
import PasswordsListView from "./views/PasswordListView";
import ViewType from "./other/ViewType"
import LocalRegistrationView from "./views/LocalRegistrationView";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeView: ViewType.defaultLoginView,
        }
    }

    changeActiveView = (newActiveView) => {
        this.setState({activeView: newActiveView});
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
}

export default App;
