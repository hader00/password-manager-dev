import React from 'react'
import PropTypes from 'prop-types';
import Field from "../components/Field";
import Header from "../components/Header";
import {PasswordItemViewController} from "../../ViewController";

export class PasswordItemView extends PasswordItemViewController {

    static defaultProps = {
        password: {},
        inputReadOnly: false
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.password,
        }
        console.log(this.props.password)
    }


    render() {
        return (
            <>
                <Header buttonText="<" text={this.state.Title} buttonFunc={this.popView}/>
                <div className="single-password-item">
                    <Field text={"Title"} value={this.state.Title} type={"text"} placeholder={"Enter Title"}
                           name={"Title"} id={"Title"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)}/>
                    <Field text={"Username"} value={this.state.Username} type={"text"} placeholder={"Enter Username"}
                           name={"Username"} id={"Username"} inputReadOnly={this.props.inputReadOnly}
                           inputRequired={true} onChange={e => this.onChange(e)}/>
                    <Field text={"Password"} value={this.state.Password} type={"password"}
                           placeholder={"Enter Password"} name={"Password"} id={"Password"}
                           inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)} showViewPassOptions={!this.props.addingNewItem}/>
                    <Field text={"Description"} value={this.state.Description} type={"text"}
                           placeholder={"Enter Description"} name={"Description"} id={"Description"}
                           inputReadOnly={this.props.inputReadOnly} inputRequired={false}
                           onChange={e => this.onChange(e)}/>
                    <Field text={"Url"} value={this.state.Url} type={"text"} placeholder={"Enter URL"} name={"Url"}
                           id={"Url"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)}/>
                </div>
                {
                    (!this.props.inputReadOnly && !this.props.addingNewItem) ?
                        <>
                            <button id="submit-button" type="button" onClick={this.updatePassword}>{"Update"}</button>
                            <button className="cancel-btn" type="button"
                                    onClick={this.deletePassword}>{"Delete"}</button>
                        </> :
                        (!this.props.addingNewItem) ?
                            <button onClick={this.openBrowser}>{"Visit page"}</button> :
                            <button id="submit-button" type="submit" onClick={this.addPassword}>{"Save"}</button>
                }
                {
                    (this.props.addingNewItem) ?
                        <button className="submit-button" type="button"
                                onClick={this.generatePassword}>{"GeneratePassword"}</button>
                        :
                        <></>
                }
            </>
        )
    };

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }


    openBrowser = () => {
        window.electron.shellOpenExternal("https://" + this.state.Url);
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

