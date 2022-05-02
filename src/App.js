import React from 'react';
import SwitchComponents from './shared/components/SwitchComponent';
import DefaultLoginView from "./views/DefaultLoginView";
import RegistrationView from "./views/RegistrationView";
import LocalLoginView from "./views/LocalLoginView";
import PasswordsListView from "./shared/views/PasswordListView";
import PMReactUtils from "./shared/other/PMReactUtils"
import LocalRegistrationView from "./views/LocalRegistrationView";
import PasswordItemView from "./shared/views/PasswordItemView";
import {Box, Container} from "@material-ui/core";
import AccountView from "./views/AccountView";
import {CustomComponent} from "./ViewController";
import './shared/App.css';


/**
 * Class App - initialization of React application
 * This class handles switches between views of the front-end application.
 *
 * When mounted it asks electron for default view and sets it.
 *
 * @param   activeView              currently active view
 * @param   passwords               passwords array provided by electron
 * @param   filteredPasswords       passwords array filtered by filter in passwordListView
 * @param   passwordItem            selected password from the passwordListView
 */
class App extends CustomComponent {
    constructor(props) {
        super(props);
        this.state = {
            activeView: null,
            passwords: [],
            filteredPasswords: [],
            passwordItem: {}
        }
    }

    render() {
        return (
            <Container maxWidth="sm">
                <Box>
                    <SwitchComponents active={this.state.activeView}>
                        <AccountView componentName={PMReactUtils.ViewType.accountView}
                                     changeParentsActiveView={this.changeActiveView}/>
                        <DefaultLoginView componentName={PMReactUtils.ViewType.defaultLoginView}
                                          changeParentsActiveView={this.changeActiveView}/>
                        <LocalLoginView componentName={PMReactUtils.ViewType.localLoginView}
                                        changeParentsActiveView={this.changeActiveView}/>
                        <LocalRegistrationView componentName={PMReactUtils.ViewType.localRegistrationView}
                                               changeParentsActiveView={this.changeActiveView}/>
                        <RegistrationView componentName={PMReactUtils.ViewType.registrationView}
                                          changeParentsActiveView={this.changeActiveView}/>
                        <PasswordsListView componentName={PMReactUtils.ViewType.passwordListView}
                                           changeParentsActiveView={this.changeActiveView}
                                           passwords={this.state.passwords}
                                           filteredPasswords={this.state.filteredPasswords}
                                           setFilteredPasswords={this.setFilteredPasswords}
                                           setPasswordItem={this.setPasswordItem}
                                           fetchAllPasswords={this.fetchAllPasswords}
                                           clearAppState={this.clearAppState}
                        />
                        <PasswordItemView
                            componentName={PMReactUtils.ViewType.passwordItem}
                            changeParentsActiveView={this.changeActiveView}
                            password={this.state.passwordItem.password}
                            inputReadOnly={this.state.passwordItem.inputReadOnly}
                            addingNewItem={this.state.passwordItem.addingNewItem}
                        />
                    </SwitchComponents>
                </Box>
            </Container>
        );
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Asks electron for defaultView and sets it as activeView
     */
    componentDidMount() {
        window.electron.getDefaultView().then((response) => {
            this.setState({activeView: response.defaultView})
        });
    }

    /**
     * fetchAllPasswords function is called after successful login
     * Asks electron for passwords array,
     * sets activeView to PMReactUtils.ViewType.defaultLoginView
     */
    fetchAllPasswords = () => {
        window.electron.fetchAllPPasswords().then((result) => {
            if (this.isEmpty(result.response)) {
                this.setState({activeView: PMReactUtils.ViewType.defaultLoginView})
            } else {
                this.setState({passwords: result.response});
            }
        });
    }

    /**
     * setFilteredPasswords function is sets filteredPasswords array
     * with filtered passwords by users input
     *
     * @param   value   filteredPasswords array
     */
    setFilteredPasswords = (value) => {
        this.setState({filteredPasswords: value});
    }

    /**
     * changeActiveView function changes current activeView
     *
     @param   newActiveView   activeView
     */
    changeActiveView = (newActiveView) => {
        this.setState({activeView: newActiveView});
    }

    /**
     * setPasswordItem function opens PasswordView
     * with selected passwordItem
     *
     * @param   newPasswordItem   passwordItem object
     */
    setPasswordItem = (newPasswordItem) => {
        this.setState({passwordItem: newPasswordItem});
    }

    /**
     * clearAppState function clears class states after logout
     */
    clearAppState = () => {
        this.setState({activeView: null})
        this.setState({passwords: []})
        this.setState({filteredPasswords: []})
        this.setState({passwordItem: {}})
    }
}

export default App;
