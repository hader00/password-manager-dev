import React, {Component} from 'react';
import SwitchComponents from './shared/components/SwitchComponent';
import DefaultLoginView from "./shared/views/DefaultLoginView";
import RegistrationView from "./shared/views/RegistrationView";
import LocalLoginView from "./shared/views/LocalLoginView";
import PasswordsListView from "./shared/views/PasswordListView";
import ViewType from "./shared/other/ViewType"
import LocalRegistrationView from "./shared/views/LocalRegistrationView";
import PasswordItemView from "./shared/views/PasswordItemView";
import {Box, Container} from "@material-ui/core";


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeView: null,
            passwords: [],
            filteredPasswords: [],
            passwordItem: {},
        }
    }

    render() {
        return (
            <Container maxWidth="sm">
                <Box>
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
                                           changeParentsActiveView={this.changeActiveView}
                                           passwords={this.state.passwords}
                                           filteredPasswords={this.state.filteredPasswords}
                                           setFilteredPasswords={this.setFilteredPasswords}
                                           setPasswordItem={this.setPasswordItem}
                                           fetchAllPasswords={this.fetchAllPasswords}/>
                        <PasswordItemView
                            componentName={ViewType.passwordItem}
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

    componentDidMount() {
        window.electron.getDefaultView().then((response) => {
            return this.setState({activeView: response.defaultView})
        });
    }

    fetchAllPasswords = () => {
        console.log("Fetching all passwords");
        window.electron.fetchAllPPasswords().then((result) => {
            this.setState({passwords: result.response});
        });
    }

    setFilteredPasswords = (value) => {
        this.setState({filteredPasswords: value});
    }

    changeActiveView = (newActiveView) => {
        this.setState({activeView: newActiveView});
    }

    setPasswordItem = (newPasswordItem) => {
        this.setState({passwordItem: newPasswordItem});
    }
}

export default App;
