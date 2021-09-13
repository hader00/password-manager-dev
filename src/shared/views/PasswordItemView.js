import React from 'react'
import PropTypes from 'prop-types';
import Field from "../components/Field";
import Header from "../components/Header";
import {PasswordItemViewController} from "../../ViewController";
import PasswordField from "../components/PasswordField";
import PasswordGenerator from "../components/PasswordGenerator";

export class PasswordItemView extends PasswordItemViewController {

    static defaultProps = {
        password: {},
        inputReadOnly: false
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.password,
            generator: {
                length: 10,
                specialCharacters: true,
                numbers: true,
                lowerCase: true,
                upperCase: true,
            }
        }
        console.log(this.props.password)
    }


    render() {
        return (
            <>
                <Header buttonText="<" text={this.state.title} buttonFunc={this.popView}/>
                <div className="single-password-item">
                    <Field text={"Title"} value={this.state.title} type={"text"} placeholder={"Enter Title"}
                           name={"title"} id={"title"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                           onChange={e => this.onChange(e)}/>
                    <Field text={"Username"} value={this.state.username} type={"text"} placeholder={"Enter Username"}
                           name={"username"} id={"username"} inputReadOnly={this.props.inputReadOnly}
                           inputRequired={true} onChange={e => this.onChange(e)}/>
                    <PasswordField text={"Password"} value={this.state.password} type={"password"}
                                   placeholder={"Enter Password"} name={"password"} id={"password"}
                                   inputReadOnly={this.props.inputReadOnly} inputRequired={true}
                                   onChange={e => this.onChange(e)} showViewPassOptions={!this.props.addingNewItem}/>
                    <Field text={"Description"} value={this.state.description} type={"text"}
                           placeholder={"Enter Description"} name={"description"} id={"description"}
                           inputReadOnly={this.props.inputReadOnly} inputRequired={false}
                           onChange={e => this.onChange(e)}/>
                    <Field text={"Url"} value={this.state.url} type={"text"} placeholder={"Enter URL"} name={"url"}
                           id={"url"} inputReadOnly={this.props.inputReadOnly} inputRequired={true}
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
                        <div>
                            <PasswordGenerator generator={this.state.generator} onChange={this.onChange}
                                               setGeneratorState={this.onChangeGenerator}/>
                            <button className="submit-button" type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        let gen = this.state.generator;
                                        this.generatePassword(gen.length, gen.specialCharacters, gen.numbers, gen.lowerCase, gen.upperCase)
                                    }}>{"GeneratePassword"}</button>
                        </div>
                        :
                        <></>
                }
            </>
        )
    };

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    onChangeGenerator = (name, value) => {
        const newGenerator = {...this.state.generator, [name]: value}
        this.setState({generator: newGenerator});
    }

    openBrowser = () => {
        window.electron.shellOpenExternal("https://" + this.state.url);
    }

    componentDidMount() {
        if (!this.props.addingNewItem) {
            this.decryptPassword(this.state.password).then(password => {
                this.setState({password: password})
            });
        }
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

