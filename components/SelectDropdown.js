import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

export default function SelectDropdown({ clothingPosition, setClothingPosition }) {


    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const handleChange = (event) => {
        setClothingPosition(event.target.value);
    };

    return (

        <FormControl sx={{ ml: matches ? 0 : 0, minWidth: matches ? 140 : '100%', color: 'inherit' }}>
            <InputLabel id="demo-simple-select-helper-label"   >Choose Style</InputLabel>
            <Select
                labelId="demo-simple-select-helper-label"
                id="demo-simple-select-helper"
                value={clothingPosition}
                label="Choose Style"
                onChange={handleChange}
            >
                <MenuItem value={'topwear'}>Top Wear</MenuItem>
                <MenuItem value={'bottomwear'}>Bottom Wear</MenuItem>
            </Select>
        </FormControl>


    );
}