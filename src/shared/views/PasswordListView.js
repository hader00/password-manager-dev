import React, {Component} from 'react';
import Header from "../components/Header";
import PasswordItem from "../components/PasswordItem";
import PropTypes from "prop-types";
import ViewType from "../other/ViewType";
import {AccountCircle, Add} from "@material-ui/icons";
import SearchIcon from '@material-ui/icons/Search';
import {AppBar, Box, Button, IconButton, InputBase, TextField, Toolbar, Typography} from "@material-ui/core";

export class PasswordListView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: 'SELECT * FROM Passwords',
            searchInput: '',
            activePasswordID: 0,
            inputReadOnly: false,
            addingNewItem: false,

        }
    }

    componentDidMount() {
        this.props.fetchAllPasswords();
    }

    componentDidUpdate(prevProps, prevState, _) {
        if (prevState.searchInput !== this.state.searchInput) {
            this.searchItems(this.state.searchInput);
        }
    }


    searchItems = () => {
        if (this.state.searchInput !== '') {
            const filteredData = this.props.passwords.filter((item) => {
                // Todo exclude password from values
                return Object.values(item).join('').toLowerCase().includes(this.state.searchInput?.toLowerCase())
            })
            this.props.setFilteredPasswords(filteredData)
        } else {
            this.props.setFilteredPasswords(this.state.passwords)
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
            this.props.setPasswordItem(
                {
                    password: this.props.passwords.length >= 1 ? this.props.passwords.filter(pass => pass.id === this.state.activePasswordID)[0] : [],
                    parentPasswordView: this.handlePasswordView,
                    inputReadOnly: this.state.inputReadOnly,
                    addingNewItem: this.state.addingNewItem
                });
            this.props.changeParentsActiveView(ViewType.passwordItem)
            return (<></>)
        } else {
            return (
                <div className="container">
                    <AppBar variant="fullWidth">
                        <Toolbar style={{justifyContent: "space-between"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                color="primary" variant="contained"
                                onClick={() => {this.setState({addingNewItem: true})}}>{<Add/>}</Button>
                            <TextField fullWidth
                                       style={{backgroundColor: "white", borderRadius: "10px"}}
                                       focused={true}
                                       value={this.state.searchInput} variant="outlined" type="text" id="search"
                                       size="small"
                                       placeholder="Search" onChange={(e) => {this.setState({searchInput: e.target.value})}}/>
                        </Toolbar>
                    </AppBar>
                    <Box style={{paddingTop: "30px"}}>
                        <p id="no-items"> {(this.props.passwords.size === 0) ? "No Passwords" : ""}</p>
                        <div id="passwords">
                            {(this.state.searchInput?.length >= 1 && this.props.filteredPasswords?.length >= 1) ? (
                                this.props.filteredPasswords?.map((password) => {
                                    return (
                                        <PasswordItem
                                            key={password.id}
                                            password={password}
                                            parentPasswordView={this.handlePasswordView}
                                        />
                                    )
                                })
                            ) : (
                                this.props.passwords?.length >= 1 ? (
                                    this.props.passwords?.map((password) => {
                                        return (
                                            <PasswordItem
                                                key={password.id}
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
                    </Box>
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
