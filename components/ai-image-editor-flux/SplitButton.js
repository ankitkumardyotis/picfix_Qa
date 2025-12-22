import * as React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import {
    Dashboard,
    PhotoLibrary,
    Article,
    Logout,
    AccountBalanceRounded,
    PriceChange
} from '@mui/icons-material';

const options = [
    { label: 'Dashboard', icon: <Dashboard sx={{ fontSize: 18 }} />, path: '/dashboard' },
    { label: 'Gallery', icon: <PhotoLibrary sx={{ fontSize: 18 }} />, path: '/gallery' },
    { label: 'Pricing', icon: <PriceChange sx={{ fontSize: 18 }} />, path: '/pricing' },
    { label: 'Blog', icon: <Article sx={{ fontSize: 18 }} />, path: '/blog' },
    { label: 'Sign Out', icon: <Logout sx={{ fontSize: 18 }} />, path: '/logout' }
];

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
    width: '100%',
    '& .MuiButtonGroup-grouped': {
        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        '&:not(:last-of-type)': {
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        },
    },
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    padding: theme.spacing(1, 2),
    // background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    // '&:hover': {
    //     background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
    //     // transform: 'translateY(-2px)',
    //     boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
    // },
    '&:hover': {
        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
        // transform: 'none',
        boxShadow: 'none',
    },
    transition: 'all 0.3s ease',
}));

const StyledDropdownButton = styled(Button)(({ theme }) => ({
    borderRadius: `0 ${theme.spacing(3)} ${theme.spacing(3)} 0`,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.8rem',
    padding: theme.spacing(1, 1.5),
    minWidth: 'auto',
    background: 'linear-gradient(135deg,rgb(251,1,118) 0%, #d76d77 50%, #fbc901 100%)',
    // background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
    // '&:hover': {
    //     background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
    //     // transform: 'translateY(-2px)',
    //     boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
    // },
    '&:hover': {
        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
    },
    transition: 'all 0.3s ease',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    backdropFilter: 'blur(10px)',
    background: alpha(theme.palette.background.paper, 0.95),
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    fontSize: '0.8rem',
    fontWeight: 500,
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0.5, 1),
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
    '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
        },
    },
}));

export default function SplitButton() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const theme = useTheme();
    const router = useRouter();

    const handleClick = () => {
        const selectedOption = options[selectedIndex];
        if (selectedOption.path === '/logout') {
            // Handle logout logic here
            console.log('Logging out...');
            // You can add your logout logic here
        } else {
            router.push(selectedOption.path);
        }
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);

        const selectedOption = options[index];
        if (selectedOption.path === '/logout') {
            // Handle logout logic here
            console.log('Logging out...');
            // You can add your logout logic here
        } else {
            router.push(selectedOption.path);
        }
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <React.Fragment>
            <StyledButtonGroup
                variant="contained"
                ref={anchorRef}
                aria-label="Navigation menu"
                disableElevation
            >
                <StyledButton
                    onClick={handleClick}
                    startIcon={options[selectedIndex].icon}
                    sx={{ flex: 1 }}
                >
                    {options[selectedIndex].label}
                </StyledButton>
                <StyledDropdownButton
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select navigation option"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                >
                    <ArrowDropDownIcon sx={{ fontSize: 20 }} />
                </StyledDropdownButton>
            </StyledButtonGroup>
            <Popper
                sx={{
                    zIndex: 1300,
                    width: anchorRef.current?.offsetWidth || 'auto'
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                placement="bottom-start"
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                    >
                        <StyledPaper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    id="split-button-menu"
                                    autoFocusItem
                                    sx={{ py: 1 }}
                                >
                                    {options.map((option, index) => (
                                        <StyledMenuItem
                                            key={option.label}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                            }}
                                        >
                                            {option.icon}
                                            {option.label}
                                        </StyledMenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </StyledPaper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
}