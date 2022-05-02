import React from 'react'
import PropTypes from 'prop-types';
import {PasswordItemViewController} from "../../ViewController";
import PasswordField from "../components/PasswordField";
import PasswordGenerator from "../components/PasswordGenerator";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    Modal,
    TextField,
    Toolbar,
    Typography
} from "@material-ui/core";
import PMReactUtils from "../other/PMReactUtils";
import * as LANGUAGE from '../other/language_en.js';

/**
 * Class PasswordItemView
 * This class provides view for password viewing and editing.
 *
 * @param   titleError               title error state
 * @param   titleHelperText          title error helper text state
 * @param   generator                generator properties
 * @param   showGenerator            open generator state
 * @param   inputReadOnly            view mode property
 * @param   addingNewItem            add new password mode
 */
export class PasswordItemView extends PasswordItemViewController {


    /**
     * defaultProps
     *
     * @param   password            password object
     * @param   open                open modal
     * @param   updateLoading       loading animation for update
     * @param   deleteLoading       loading animation for delete
     * @param   saveLoading         loading animation for save
     * @param   inputReadOnly       view mode property
     */
    static defaultProps = {
        password: {
            username: "",
            password: "",
            description: "",
            url: "",
            server: "",
        },
        open: false,
        updateLoading: false,
        deleteLoading: false,
        saveLoading: false,
        inputReadOnly: false
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.password,
            titleError: false,
            titleHelperText: "",
            generator: {
                length: 10,
                specialCharacters: true,
                numbers: true,
                lowerCase: true,
                upperCase: true,
            },
            showGenerator: false,
            inputReadOnly: this.props.inputReadOnly,
            addingNewItem: this.props.addingNewItem
        }
    }


    render() {
        return (
            <>
                <FormControl style={{display: "flex"}}>
                    <AppBar>
                        <Toolbar style={{justifyContent: "space-between"}}>
                            <div className="left0">
                                <Button
                                    style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                    startIcon={<ArrowBackIosIcon/>}
                                    color="primary" variant="contained"
                                    onClick={() => {
                                        this.handleViewChange(PMReactUtils.ViewType.passwordListView)
                                    }}>{LANGUAGE.BACK}</Button>
                            </div>
                            <div className="dFlex">
                                <Typography style={{fontWeight: "bold"}}
                                            variant="h5">{(this.state.title === undefined || this.state.title === "") ? LANGUAGE.NEW_ITEM : this.state.title}</Typography>
                            </div>
                            <div className="right0"/>
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={() => {
                                    if (this.state.inputReadOnly) {
                                        this.setState({inputReadOnly: false})
                                    } else {
                                        this.setState({open: true})
                                    }
                                }}
                            >
                                {(this.state.addingNewItem) ?
                                    <></>
                                    :
                                    <>
                                        {(this.state.inputReadOnly) ? <CreateIcon/> : <DeleteIcon/>}
                                    </>
                                }
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Box className="pT60">
                        <TextField inputProps={{
                            readOnly: Boolean(this.state.inputReadOnly),
                            disabled: Boolean(this.state.inputReadOnly),
                        }} fullWidth style={{marginTop: "10px"}} text={"Title"} value={this.state.title} type={"text"}
                                   label={LANGUAGE.TITLE}
                                   name={"title"} id={"title"} inputRequired={true}
                                   onChange={e => this.onChange(e)}
                                   helperText={this.state.titleHelperText}
                                   required
                                   error={this.state.titleError}
                        />
                        <TextField inputProps={{
                            readOnly: Boolean(this.state.inputReadOnly),
                            disabled: Boolean(this.state.inputReadOnly),
                        }}
                                   fullWidth style={{marginTop: "10px"}} text={LANGUAGE.USERNAME}
                                   value={this.state.username}
                                   type={"text"}
                                   label={"Username"}
                                   name={"username"} id={"username"}
                                   inputRequired={true} onChange={e => {
                            this.onChange(e)
                        }}/>
                        <PasswordField fullWidth text={LANGUAGE.PASSWORD} value={this.state.password} type={"password"}
                                       togglePasswordGenerator={this.togglePasswordGenerator}
                                       showingGenerator={this.state.showGenerator}
                                       ws={this.props.ws}
                                       revertWSonMessage={this.props.revertWSonMessage}
                                       placeholder={LANGUAGE.PASSWORD} name={"password"} id={"password"}
                                       inputReadOnly={this.state.inputReadOnly} inputRequired={true}
                                       onChange={e => {
                                           this.onChange(e);
                                       }} showViewPassOptions={!this.props.addingNewItem}/>
                        {
                            (this.state.showGenerator) ?
                                <Box className="generator">
                                    <PasswordGenerator generator={this.state.generator} onChange={this.onChange}
                                                       setGeneratorState={this.onChangeGenerator}/>
                                    <Button fullWidth color="primary" className="submit-button" type="button"
                                            variant="contained"
                                            disabled={!(this.state.generator.specialCharacters || this.state.generator.numbers || this.state.generator.lowerCase || this.state.generator.upperCase)}
                                            style={{display: "inline-block", margin: "0 auto"}}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                let gen = this.state.generator;
                                                this.generatePassword(gen.length, gen.specialCharacters, gen.numbers, gen.lowerCase, gen.upperCase)
                                            }}>{this.state.password === "" || this.state.password === undefined ? LANGUAGE.GENERATE_PASSWORD : LANGUAGE.RE_GENERATE_PASSWORD}</Button>
                                </Box>
                                :
                                <></>
                        }
                        <TextField
                            inputProps={{
                                readOnly: Boolean(this.state.inputReadOnly),
                                disabled: Boolean(this.state.inputReadOnly),
                            }}
                            fullWidth style={{marginTop: "10px"}} multiline={true} text={LANGUAGE.DESCRIPTION}
                            value={this.state.description} type={"text"}
                            label={LANGUAGE.DESCRIPTION} name={"description"} id={"description"}
                            inputRequired={false}
                            onChange={e => this.onChange(e)}/>
                        <TextField
                            inputProps={{
                                readOnly: Boolean(this.state.inputReadOnly),
                                disabled: Boolean(this.state.inputReadOnly),
                            }}
                            fullWidth style={{marginTop: "10px"}} text={LANGUAGE.URL} value={this.state.url}
                            type={"text"}
                            label={LANGUAGE.URL} name={"url"}
                            id={"url"} inputRequired={true}
                            onChange={e => this.onChange(e)}/>
                        <Box className="pT10">
                            {
                                (!this.state.inputReadOnly && !this.props.addingNewItem) ?
                                    <>
                                        <Button fullWidth style={{backgroundColor: "#007fff"}} color="primary"
                                                id="submit-button" type="button"
                                                variant="contained"
                                                onClick={(e) => {
                                                    this.updatePassword(e)
                                                }}>{LANGUAGE.UPDATE}
                                            {this.state.updateLoading ?
                                                <CircularProgress
                                                    style={{marginLeft: "10px", color: "white"}}
                                                    size={20}
                                                />
                                                :
                                                <></>
                                            }</Button>
                                    </> :
                                    (!this.props.addingNewItem) ?
                                        <>
                                            {this.isEmpty(this.state.url) ?
                                                <></>
                                                :
                                                <Button fullWidth style={{backgroundColor: "green"}} color="primary"
                                                        variant="contained"
                                                        hidden={this.isEmpty(this.state.url)}
                                                        onClick={this.openBrowser}>{"Visit page"}</Button>
                                            }
                                        </>
                                        :
                                        <Button fullWidth color="primary" id="submit-button" type="submit"
                                                variant="contained"
                                                onClick={() => {
                                                    this.savePassword()
                                                }}>
                                            {LANGUAGE.SAVE}
                                            {this.state.saveLoading ?
                                                <CircularProgress
                                                    style={{marginLeft: "10px", color: "white"}}
                                                    size={20}
                                                />
                                                :
                                                <></>
                                            }
                                        </Button>
                            }
                        </Box>
                    </Box>
                </FormControl>
                <Modal
                    className="modalOuter"
                    open={this.state.open}
                    onClose={() => {
                        this.setState({open: false})
                    }}
                >
                    <div className="modalInner">
                        <Typography style={{textAlign: "center"}}
                                    variant="h5">{LANGUAGE.DO_YOU_WANT_TO_DELETE}</Typography>
                        <div className="dGrid justifyCenter">
                            <div className="dFlex pT10">
                                <Button fullWidth style={{marginRight: "10px", marginTop: "10px"}} color="secondary"
                                        className="cancel-btn"
                                        type="button"
                                        startIcon={<DeleteIcon
                                            style={this.state.deleteLoading ? {marginLeft: "10px"} : {}}/>}
                                        endIcon={this.state.deleteLoading ? <CircularProgress
                                            style={{marginRight: "10px", color: "white"}}
                                            size={20}
                                            thickness={6}
                                        /> : <></>}
                                        variant="contained"
                                        onClick={async (e) => {
                                            await this.deletePassword(e)
                                        }}>Delete
                                </Button>
                                <Button fullWidth style={{marginLeft: "10px", marginTop: "10px"}} color="primary"
                                        variant="contained"
                                        type="button" onClick={() => {
                                    this.setState({open: false})
                                }}>{LANGUAGE.CANCEL}</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </>
        )
    };

    /**
     * savePassword function
     * performs save of new password, with validation check of required field
     */
    savePassword = () => {
        if (this.state.title?.length > 0) {
            this.addPassword();
        } else {
            this.toggleTitleError();
        }
    }

    /**
     * onChange function
     * custom onChange function with validator
     */
    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
        if (e.target.name === "title" && e.target.value?.length > 0) {
            this.setState({titleError: false})
            this.setState({titleHelperText: PMReactUtils.EMPTY_STRING})
        } else if (e.target.name === "title" && !(e.target.value?.length > 0)) {
            this.setState({titleError: true})
            this.setState({titleHelperText: LANGUAGE.PLEASE_ENTER_TITLE})
        }
    }

    /**
     * togglePasswordGenerator function
     * open password generator view
     */
    togglePasswordGenerator = () => {
        this.setState({showGenerator: !this.state.showGenerator})
    }

    /**
     * toggleTitleError function
     * validator for title state
     */
    toggleTitleError = () => {
        this.setState({titleError: !this.state.titleError})
        if (this.state.titleHelperText === "") {
            this.setState({titleHelperText: LANGUAGE.PLEASE_ENTER_TITLE})
        } else {
            this.setState({titleHelperText: PMReactUtils.EMPTY_STRING})
        }

    }

    /**
     * onChangeGenerator function
     * onChange function for password generator
     */
    onChangeGenerator = (name, value) => {
        const newGenerator = {...this.state.generator, [name]: value}
        this.setState({generator: newGenerator});
    }

    /**
     * checkURL function
     * Handles URL provided by the password object, for "open browser"
     * adds prefix the URL if the users did not include it.
     */
    checkURL = () => {
        let url = this.state.url
        if (!this.state.url?.startsWith(PMReactUtils.HTTP)) {
            url = `${PMReactUtils.HTTPS}${PMReactUtils.PREFIX}${url}`
        }
        this.setState({url: url})
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * checks URL if viewing or editing existing password and decrypts
     * password of currently opened password item object
     * Adds listeners for menu actions
     */
    componentDidMount() {
        this.passwordItemViewDidMount()
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

