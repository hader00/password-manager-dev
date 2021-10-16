import React, {Component} from 'react'
import PropTypes from "prop-types";
import {Button, TextField} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SettingsIcon from '@material-ui/icons/Settings';


export class PasswordField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: props.type,
        }
    }

    render() {
        const props = this.props
        return (
            <div style={{marginTop: "10px", display: "flex"}}>
                <TextField value={props.value || ''}
                           style={{display: "flex", width: "70vw"}}
                           type={this.state.type}
                           label={props.placeholder}
                           name={props.name} id={props.id} onChange={props.onChange}/>
                {(this.state.type === "password") ?
                    <>
                        {props.value?.length > 0 ?
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async () => {
                                    // Todo decrypt password, ask electron, save to variable, nullify on view change or on hide
                                    this.setState({type: "text"});
                                }}>
                                <VisibilityIcon/></Button>
                            :
                            <></>
                        }
                        {props.value?.length > 0 ?
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await this.copy(props.value);
                                }}>
                                <FileCopyIcon/></Button>
                            :
                            <></>
                        }
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px", boxShadow: "none"}}
                                variant={props.showingGenerator === true ? "contained" : ""}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                    :
                    <>
                        <Button
                            style={{paddingBottom: "15px", paddingTop: "15px"}}
                            variant=""
                            onClick={() => {
                                // Todo nullify on view change or on hide
                                this.setState({type: "password"});
                            }}>
                            <VisibilityOffIcon/></Button>
                        <Button
                            style={{paddingBottom: "15px", paddingTop: "15px"}}
                            variant=""
                            onClick={async (e) => {
                                e.preventDefault();
                                await this.copy(props.value);
                            }}>
                            <FileCopyIcon/></Button>
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                style={{paddingBottom: "15px", paddingTop: "15px"}}
                                variant=""
                                onClick={async (e) => {
                                    e.preventDefault();
                                    props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                }
            </div>
        )
    }

    copy = async (text) => {
        await navigator.clipboard.writeText(text);
        // todo add visual popup
    }

    async componentDidMount() {
        const props = this.props
        let inputField = document.getElementById(props.id)

        if (props.inputRequired) {
            inputField.setAttribute("required", props.inputRequired)
        }
        if (props.inputReadOnly) {
            inputField.setAttribute("readOnly", props.inputReadOnly)
        }
    }
}

PasswordField.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,

    showViewPassOptions: PropTypes.bool,
    value: PropTypes.string,
    passwordType: PropTypes.string,
}

export default PasswordField;