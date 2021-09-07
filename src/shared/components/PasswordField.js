import React, {Component} from 'react'
import PropTypes from "prop-types";


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
            <div>
                <label htmlFor={props.name}><b>{props.text}</b></label>
                <input value={props.value}
                       type={this.state.type}
                       placeholder={props.placeholder}
                       name={props.name} id={props.id} onChange={props.onChange}/>
                {(this.state.type === "password") ?
                        <>
                            <button onClick={async () => {
                                // Todo decrypt password, ask electron, save to variable, nullify on view change or on hide
                                this.setState({type: "text"});
                            }}>
                                ViewPassWord
                            </button>
                            <button onClick={async (e) => {
                                e.preventDefault();
                                await this.copy(props.value);
                            }}>
                                CopyPassWord
                            </button>
                        </>
                        :
                        <>
                            <button onClick={() => {
                                // Todo nullify on view change or on hide
                                this.setState({type: "password"});
                            }}>
                                HidePassWord
                            </button>
                            <button onClick={async (e) => {
                                e.preventDefault();
                                await this.copy(props.value);
                            }}>
                                CopyPassWord
                            </button>
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