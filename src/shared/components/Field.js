import React from 'react'
import PropTypes from "prop-types";
import {FieldController} from "../../ViewController";


export class Field extends FieldController {
    constructor(props) {
        super(props);
        this.state = {
            passwordType: "password",
            showPassword: false,
            password: "",
            encrypted: this.props.value,
            passwordIsEncrypted: true
        }
        console.log(props.name, props.showViewPassOptions, props.passwordType)
    }

    render() {
        const props = this.props
        return (
            <div>
                <label htmlFor={props.name}><b>{props.text}</b></label>
                <input value={this.state.showPassword ? this.state.password : props.value}
                       type={(props.type === "password") ? this.state.passwordType : props.type}
                       placeholder={props.placeholder}
                       name={props.name} id={props.id} onChange={props.onChange}/>
                {(props.name === "Password" && props.showViewPassOptions) ?
                    (this.state.passwordType === "password") ?
                        <>
                            <button onClick={async () => {
                                // Todo decrypt password, ask electron, save to variable, nullify on view change or on hide
                                this.setState({passwordType: "text"});
                                const password = await this.decryptPassword(this.props.value)
                                this.setState({password: password});
                                this.setState({showPassword: true});
                            }}>
                                ViewPassWord
                            </button>
                            <button onClick={async (e) => {
                                e.preventDefault();
                                const password = await this.decryptPassword(this.props.value)
                                console.log("password => ", password);
                                this.copy(password);
                            }}>
                                CopyPassWord
                            </button>
                        </>
                        :
                        <>
                            <button onClick={() => {
                                // Todo nullify on view change or on hide
                                this.setState({passwordType: "password"});
                                this.setState({password: ""});
                                this.setState({showPassword: false});
                            }}>
                                HidePassWord
                            </button>
                            <button onClick={async (e) => {
                                e.preventDefault();
                                const password = await this.decryptPassword(this.props.value)
                                console.log("password => ", password);
                                this.copy(password);
                            }}>
                                CopyPassWord
                            </button>
                        </>
                    :
                    <></>
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
        if (!props.inputReadOnly && props.name === "Password") {
            this.decryptPassword(props.value).then(r =>{
                this.setState({showPassword: true})
                this.setState({passwordIsEncrypted: false})
                this.setState({password: r })
            })
        }
    }
}

Field.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,

    showViewPassOptions: PropTypes.bool,
    value: PropTypes.string,
    passwordType: PropTypes.string,
}

export default Field;