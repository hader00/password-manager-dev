import React, {Component} from 'react';
import PasswordItemView from "./PasswordItemView";
import Header from "../components/Header";
import PasswordItem from "../components/PasswordItem";
import PropTypes from "prop-types";

export class PasswordListView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: 'SELECT * FROM Passwords',
            searchInput: '',
            response: null,
            activePasswordID: 0,
            inputReadOnly: false,
            addingNewItem: false,
            passwords: [
                {
                    Id: 1,
                    Title: "FB",
                    Description: "My login for FB Account",
                    Url: "www.facebook.com",
                    Username: "id@ikd.com",
                    Password: "FBpasswordLOLik123$$$$",
                },
            ],
            filteredPasswords: [],
        }
    }

    componentDidMount() {
        console.log('mounting')
        window.electron.loginMode().then((result) => {
            console.log("result => ", result)
            if (result.loginMode === 0) {
                this.fetchAll();
            } else {
                this.fetchAllPPasswords();
            }
        });
    }


    send = (message) => {
        window.electron.dbMessenger(message).then((result) => {
            this.setState({response: result});
            this.setState({passwords: result});
            console.log(result)
        });
    }


    fetchAll = () => {

        window.electron.loginMode().then((result) => {
            console.log("result => ", result)
            if (result.loginMode === 0) {
                let message = "SELECT * FROM Passwords"
                window.electron.dbMessenger(message).then((result) => {
                    console.log("res", result);
                    this.setState({response: result});
                    this.setState({passwords: result});
                });
            } else {
                this.fetchAllPPasswords();
            }
        });


    }

    fetchAllPPasswords = () => {
        console.log("Fetching all passwords");
        window.electron.fetchAllPPasswords().then((result) => {

            this.setState({response: result.response});
            this.setState({passwords: result.response});
        });
    }

    searchItems = (searchValue) => {
        this.setState({searchInput: searchValue});
        if (this.state.searchInput !== '') {
            const filteredData = this.state.passwords.filter((item) => {
                // Todo exclude password from values
                return Object.values(item).join('').toLowerCase().includes(this.state.searchInput.toLowerCase())
            })
            this.setState({filteredPasswords: filteredData});
        } else {
            this.setState({filteredPasswords: this.state.passwords});
        }
    }

    handlePasswordView = (activePasswordVal, openTypeVal, addingNewItemVal) => {
        console.log(activePasswordVal, openTypeVal, addingNewItemVal);
        this.setState({activePasswordID: activePasswordVal});
        this.setState({inputReadOnly: openTypeVal});
        this.setState({addingNewItem: addingNewItemVal});
    }
    render() {
    if (this.state.activePasswordID > 0 || this.state.addingNewItem === true) {
            return (
                <div className="container">
                    <PasswordItemView
                        password={this.state.passwords.length >= 1 ? this.state.passwords.filter(pass => pass.Id === this.state.activePasswordID)[0] : []}
                        parentPasswordView={this.handlePasswordView}
                        inputReadOnly={this.state.inputReadOnly}
                        addingNewItem={this.state.addingNewItem}
                        fetchAllHandler={this.fetchAll}
                    />
                </div>
            );
        } else {
            return (
                <div className="container">
                    <Header buttonText="+" hStyle="input" buttonFunc={() => {this.setState({addingNewItem: true})}} onChange={(e) => this.searchItems(e.target.value)}/>
                    <div>
                        <p id="no-items"> {(this.state.passwords.size === 0) ? "No Passwords" : ""}</p>
                        <div id="passwords">
                            {(this.state.searchInput.length > 1 && this.state.filteredPasswords.length >= 1)? (
                                this.state.filteredPasswords.map((password) => {
                                    return(
                                        <PasswordItem
                                            key={password.Id}
                                            password={password}
                                            parentPasswordView={this.handlePasswordView}
                                        />
                                    )
                                })
                            ) : (
                                this.state.passwords.length >= 1 ? (
                                    this.state.passwords.map((password) => {
                                        return(
                                            <PasswordItem
                                                key={password.Id}
                                                password={password}
                                                parentPasswordView={this.handlePasswordView}
                                            />
                                        )
                                    })
                                ) : (
                                    <></>
                                )
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    }
}


PasswordListView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default PasswordListView;