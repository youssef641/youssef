import React from 'react'
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, FormHelperText } from '@material-ui/core';

export default function Select(props) {

    const { name, label, value,error=null, onChange, options } = props;

    return (
        
        <FormControl variant="outlined"
        {...(error && {error:true})}>
            <InputLabel>{label}</InputLabel>
            <MuiSelect
                label={label}
                name={name}
                value={value}
                onChange={onChange}>
                   
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Réceptionniste">Réceptionniste</MenuItem>
    <MenuItem value="Restaurant">Restaurant</MenuItem>
    <MenuItem value="Evenement">Evenement</MenuItem>
            </MuiSelect>
            {error && <FormHelperText>{error}</FormHelperText>}
           
        </FormControl>
    )
}
