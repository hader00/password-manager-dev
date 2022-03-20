import React, {Component} from 'react'
import PropTypes from "prop-types";
import {Box, Button, FormControlLabel, IconButton, Input, Switch, TextField, Tooltip} from "@material-ui/core";
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
                         <Button  variant="contained"
                                  component="label"
                         >
                             {this.props.location === "" ? "Select Folder" : "Change"}
                            <input id="hiddenField" type="file" name={this.props.name} hidden/>
                         </Button>
                            <label style={{color: "gray", paddingLeft:"10px"}}>{this.props.location}</label>
                        </div>
                        :
                        <TextField id="hiddenField" type={this.props.type}
                                   value={this.props.value}
                                   onKeyDown={this.props.onKeyDown}
                                   onChange={(e) => {
                                       if ((e.target.value?.length > 0)) {
                                           this.setState({hiddenField: true})
                                       }
                                       this.props.onChange(e)}
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