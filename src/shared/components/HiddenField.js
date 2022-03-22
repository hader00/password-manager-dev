import React, {Component} from 'react'
import PropTypes from "prop-types";
import {Box, Button, FormControlLabel, IconButton, Switch, TextField, Tooltip} from "@material-ui/core";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';


export class HiddenField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileChosen: false,
            hiddenField: (this.props.toggle)
        }
    }

    render() {
        return (
            <Box style={{display: "block"}}>
                <Box style={{display: "flex"}}>
                    <FormControlLabel
                        checked={this.state.hiddenField}
                        value="start"
                        onChange={this.toggle}
                        control={<Switch color="primary"/>}
                        label={
                            <Box style={{display: "flex", color: "dimgray"}}>
                                <p>{this.props.text}</p>
                                <Tooltip title={this.props.helpDescription}>
                                    <IconButton aria-label="questionMark">
                                        <HelpOutlineIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        }
                        labelPlacement="end"
                    />

                </Box>
                <Box hidden={!this.state.hiddenField} style={{paddingBottom: "10px"}}>
                    {this.props.type === "file" ?
                        <div>
                            <Button
                                style={{marginBottom: "10px"}}
                                variant="contained"
                                component="label"
                            >
                                {this.props.location === "" ? this.props.placeholder : "Change"}
                                <input id="hiddenField" type="file" name={this.props.name} hidden/>
                            </Button>
                            <label style={{color: "gray", paddingLeft: "10px"}}>{this.props.location}</label>
                            <div style={{marginTop: "10px"}}/>
                            <label style={{
                                color: "red",
                                paddingLeft: "10px"
                            }}>{(this.props.location.slice(-3) !== ".db" && this.props.location !== "") ? "The file format does not seem right. Expected file format is: .db" : ""}</label>
                        </div>
                        :
                        <TextField id="hiddenField" type={this.props.type}
                                   value={this.props.value}
                                   onKeyDown={this.props.onKeyDown}
                                   onChange={(e) => {
                                       if ((e.target.value?.length > 0)) {
                                           this.setState({hiddenField: true})
                                       }
                                       this.props.onChange(e)
                                   }
                                   }
                                   defaultValue={this.props.defaultValue?.length > 0 ? this.props.defaultValue : ""}
                                   style={{display: "flex"}}
                                   label={this.props.placeholder} name={this.props.name}
                                   error={this.props.error}
                                   helperText={this.props.helperText}
                        />
                    }
                </Box>
            </Box>
        )
    }

    toggle = () => {
        this.setState({hiddenField: !this.state.hiddenField})
    }

    componentDidMount() {
        console.log("this.props.toggle", this.props.toggle)
    }
}


HiddenField.propTypes = {
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}


export default HiddenField;