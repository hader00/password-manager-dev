import React, {Component} from 'react'
import PropTypes from 'prop-types';
import Field from "../components/Field";
import Header from "../components/Header";

export class PasswordItemView extends Component {

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
                    <Field text={"Title"} value={this.state.Title} type={"text"} placeholder={"Enter Title"} name={"Title"} id={"Title"} inputReadOnly={this.props.inputReadOnly} inputRequired={true} onChange={e => this.onChange(e)}/>
                    <Field text={"Username"} value={this.state.Username} type={"text"} placeholder={"Enter Username"} name={"Username"} id={"Username"} inputReadOnly={this.props.inputReadOnly} inputRequired={true} onChange={e => this.onChange(e)}/>
                    <Field text={"Password"} value={this.state.Password} type={"password"} placeholder={"Enter Password"} name={"Password"} id={"Password"} inputReadOnly={this.props.inputReadOnly} inputRequired={true} onChange={e => this.onChange(e)} showViewPassOptions={!this.props.addingNewItem}/>
                    <Field text={"Description"} value={this.state.Description} type={"text"} placeholder={"Enter Description"} name={"Description"} id={"Description"} inputReadOnly={this.props.inputReadOnly} inputRequired={false} onChange={e => this.onChange(e)}/>
                    <Field text={"Url"} value={this.state.Url} type={"text"} placeholder={"Enter URL"} name={"Url"} id={"Url"} inputReadOnly={this.props.inputReadOnly} inputRequired={true} onChange={e => this.onChange(e)}/>
                </div>
                {
                    (!this.props.inputReadOnly && !this.props.addingNewItem) ?
                        <>
                        <button id="submit-button" type="button" onClick={this.updatePassword}>{"Update"}</button>
                        <button className="cancel-btn" type="button" onClick={this.deletePassword}>{"Delete"}</button>
                        </> :
                        (!this.props.addingNewItem) ?
                            <button onClick={this.openBrowser}>{"Visit page"}</button> :
                                <button id="submit-button" type="submit" onClick={this.addPassword}>{"Save"}</button>
                }
            </>
        )
    };

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    popView = () => {
        this.props.parentPasswordView(0, false, false);
    }

    addPassword = () => {
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        window.electron.addPassword(Title, Description, Url, Username, Password).then((result) => {
            if (result.addSuccess === true) {
                console.log(result)
                this.props.fetchAllHandler()
                this.popView();
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }

    updatePassword = () => {
        console.log("updating")
        let Id = this.state.Id;
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        window.electron.updatePassword(Id, Title, Description, Url, Username, Password).then((result) => {
            if (result.updateSuccess === true) {
                console.log(result)
                this.props.fetchAllHandler()
                this.popView();
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }

    deletePassword = () => {
        let Id = this.state.Id;
        window.electron.deletePassword(Id).then((result) => {
            console.log("deleting")
            if (result.deleteSuccess === true) {
                console.log(result)
                this.props.fetchAllHandler()
                this.popView();
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }

    openBrowser = () => {
        window.electron.shellOpenExternal("https://"+this.state.Url);
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

