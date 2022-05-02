import React from 'react'
import PropTypes from "prop-types";
import {Button, TextField} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SettingsIcon from '@material-ui/icons/Settings';
import {PasswordFieldController} from "../../ViewController";
import './../App.css';
import PMReactUtils from "../other/PMReactUtils";


/**
 * Class PasswordField
 * Field for password, handles type visibility, password generator, copy to clipboard
 *
 * @param   type    password type visibility (text or password)
 */
export class PasswordField extends PasswordFieldController {
    constructor(props) {
        super(props);
        this.state = {
            type: props.type,
        }
    }

    render() {
        return (
            <div className="flexWithMarginT">
                <TextField
                    inputProps={{
                        readOnly: Boolean(this.props.inputReadOnly),
                        disabled: Boolean(this.props.inputReadOnly),
                    }}
                    value={this.props.value || ''}
                    className="passwordFieldHeader"
                    type={this.state.type}
                    label={this.props.placeholder}
                    name={this.props.name} id={this.props.id} onChange={this.props.onChange}/>
                {(this.state.type === "password") ?
                    <>
                        {this.props.value?.length > 0 ?
                            <Button
                                className="pTB15"
                                onClick={async () => {
                                    this.setState({type: "text"});
                                }}>
                                <VisibilityIcon/></Button>
                            :
                            <></>
                        }
                        {this.props.value?.length > 0 ?
                            <Button
                                className="pTB15"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await this.copy(this.props.value);
                                }}>
                                <FileCopyIcon/></Button>
                            :
                            <></>
                        }
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                className="pTB15 boxShadowNone"
                                variant={this.props.showingGenerator === true ? "contained" : ""}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    this.props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                    :
                    <>
                        <Button
                            className="pTB15"
                            onClick={() => {
                                this.setState({type: "password"});
                            }}>
                            <VisibilityOffIcon/></Button>
                        <Button
                            className="pTB15"
                            onClick={async (e) => {
                                e.preventDefault();
                                await this.copy(this.props.value);
                            }}>
                            <FileCopyIcon/></Button>
                        {(this.props.inputReadOnly === true) ?
                            <></>
                            :
                            <Button
                                className="pTB15"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    this.props.togglePasswordGenerator();
                                }}>
                                <SettingsIcon/></Button>
                        }
                    </>
                }
            </div>
        )
    }

    /**
     * clearClipboardOnFocus function clears clipboard on focus
     *
     * Electron and chrome API (for extension) is limited
     * with clipboard access and can write only when the
     * application has focus
     */
    clearClipboardOnFocus = () => {
        window.addEventListener('focus', async function () {
            await navigator.clipboard.writeText(PMReactUtils.EMPTY_STRING);
        }, {once: true})
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