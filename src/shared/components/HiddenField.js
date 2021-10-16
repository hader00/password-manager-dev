import React, {Component} from 'react'
import PropTypes from "prop-types";
import {Box, FormControlLabel, IconButton, Input, Switch, TextField, Tooltip} from "@material-ui/core";
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';


export class HiddenField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileChosen: false,
            hiddenField: (this.props.toggle === undefined ? true : this.props.toggle)
        }
    }

    render() {
        return (
            <Box style={{display: "block"}}>
                <Box style={{display: "flex"}}>
                    <FormControlLabel
                        checked={!this.state.hiddenField}
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
                <Box hidden={this.state.hiddenField} style={{paddingBottom: "10px"}}>
                    {this.props.type === "file" ?
                        <Input variant="filled" id="hiddenField" type={this.props.type} label={this.props.placeholder}
                               name={this.props.name}/>
                        :
                        <TextField id="hiddenField" type={this.props.type}
                                   value={this.props.value}
                                   onKeyDown={this.props.onKeyDown}
                                   onChange={(e) => {
                                       if ((e.target.value?.length > 0)) {
                                           this.toggle();
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
}


HiddenField.propTypes = {
    text: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}


export default HiddenField;