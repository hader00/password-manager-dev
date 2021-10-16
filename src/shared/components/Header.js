import React, {Component} from "react";
import PropTypes from "prop-types";
import {Box, Button, Divider, TextField, Typography} from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export class Header extends Component {
    render() {
        return (
            <>
                <Box style={{height: "40px", display: "flex", marginLeft: "-15px", marginRight: "-15px"}}>
                    {this.props.icon !== undefined ?
                        <Button
                            style={{marginRight: "10px", maxWidth: "28vw", minWidth: "28vw"}}
                            startIcon={this.props.icon}
                            color="primary" variant="contained"
                            onClick={this.props.buttonFunc}>{this.props.buttonText}</Button>
                        :
                        <></>
                    }
                    {this.props.hStyle === "input" ?
                        <div style={{display: "flex"}}>
                            <TextField style={{width: "65vw", right: "0px", position: "relative"}}
                                       value={this.props.searchValue} variant="outlined" type="text" id="search"
                                       size="small"
                                       placeholder="Search" onChange={this.props.onChange}/>
                            {this.props.searchValue !== "" ?
                                <Button
                                    style={{right: "0px", position: "absolute", marginRight: "10px", marginTop: "2px"}}
                                    variant=""
                                    onClick={this.props.clearInput}
                                ><HighlightOffIcon/></Button> :
                                <></>
                            }
                        </div>
                        :
                        <Box style={{position: "fixed", left: "35%", textAlign: "center"}}>
                            <Typography style={{fontWeight: "bold", color: "dimgray"}} variant="h4"
                                        component="h4">{this.props.text}</Typography>
                        </Box>
                    }
                </Box>
                <Divider variant="fullWidth" style={{marginTop: "10px", marginLeft: "-15px", marginRight: "-15px"}}/>
            </>
        )
    }
}

Header.propTypes = {
    buttonFunc: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired,
    hStyle: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    text: PropTypes.string
}

export default Header;
