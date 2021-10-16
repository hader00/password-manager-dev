import {Component} from "react";
import {Box, Checkbox, FormControlLabel, FormGroup, Grid, Input, Slider, Typography} from "@material-ui/core";

export class PasswordGenerator extends Component {
    render() {
        return (
            <div>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.generator.specialCharacters}
                                onChange={this.changeCheckbox}
                                name="specialCharacters"
                                color="primary"
                            />
                        }
                        label="Special Characters"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.generator.specialCharacters}
                                onChange={this.changeCheckbox}
                                name="numbers"
                                color="primary"
                            />
                        }
                        label="Numbers"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.generator.specialCharacters}
                                onChange={this.changeCheckbox}
                                name="lowerCase"
                                color="primary"
                            />
                        }
                        label="Lower Case"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.generator.upperCase}
                                onChange={this.changeCheckbox}
                                name="upperCase"
                                color="primary"
                            />
                        }
                        label="Upper Case"
                    />
                </FormGroup>
                <Box style={{display: "block", paddingTop: "20px", paddingBottom: "10px"}}>
                    <Typography gutterBottom style={{textAlign: "left"}}>
                        Password length:
                    </Typography>
                    <Grid container spacing={2} alignItems="center"
                          style={{paddingLeft: "5px", paddingRight: "5px", marginTop: "-15px"}}>
                        <Grid item xs>
                            <Slider
                                value={typeof this.props.generator.length === 'number' ? this.props.generator.length : 0}
                                onChange={this.changeSlider}
                                step={1}
                                marks
                                min={8}
                                max={128}
                                name="length"
                                id="length"
                                valueLabelDisplay="auto"
                                aria-labelledby="input-slider"
                            />
                        </Grid>
                        <Grid item>
                            <Input
                                value={this.props.generator.length}
                                margin="dense"
                                type="number"
                                onChange={this.changeInput}
                                inputProps={{
                                    step: 1,
                                    min: 8,
                                    max: 128,
                                    type: 'number',
                                    'aria-labelledby': 'input-slider',
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </div>
        );
    }

    changeCheckbox = (e) => {
        const checked = e.target.checked;
        this.props.setGeneratorState(e.target.name, checked)
    }
    changeSlider = (event, value) => {
        this.props.setGeneratorState("length", value)
    }
    changeInput = (event) => {
        this.props.setGeneratorState("length", Number(event.target.value))
    };
}


PasswordGenerator.propTypes = {}


export default PasswordGenerator;