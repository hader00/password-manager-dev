import {AppBar, Button, Toolbar, Typography} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import PMReactUtils from "../other/PMReactUtils";
import * as LANGUAGE from '../other/language_en.js';
import {Component} from "react";
import PropTypes from "prop-types";

/**
 * Class AppBarHeader
 * Provides header for views
 */
class AppBarHeader extends Component {

    render() {
        return (
            <AppBar>
                <Toolbar className="flexWithSpacing">
                    <div className="arrowButton">
                        <Button
                            style={{marginRight: "10px", backgroundColor: "#007fff"}}
                            startIcon={<ArrowBackIosIcon/>}
                            color="primary" variant="contained"
                            onClick={() => this.props.handleViewChange(PMReactUtils.ViewType.defaultLoginView)}>{LANGUAGE.BACK}</Button>
                        <Typography style={{fontWeight: "bold"}} variant="h5">{this.props.text}</Typography>
                    </div>
                </Toolbar>
            </AppBar>
        )
    };
}

AppBarHeader.propTypes = {
    text: PropTypes.string.isRequired,
    handleViewChange: PropTypes.func.isRequired,
}

export default AppBarHeader;