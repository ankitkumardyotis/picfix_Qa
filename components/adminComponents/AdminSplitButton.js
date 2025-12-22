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
import { signOut } from 'next-auth/react';
import {
    Dashboard,
    Home,
    AdminPanelSettings,
    Logout,
    PriceChange,
    PhotoLibrary
} from '@mui/icons-material';

const options = [
    { label: 'Main Site', icon: <Home sx={{ fontSize: 18 }} />, path: '/' },
    { label: 'User Dashboard', icon: <Dashboard sx={{ fontSize: 18 }} />, path: '/dashboard' },
    { label: 'AI Studio', icon: <PhotoLibrary sx={{ fontSize: 18 }} />, path: '/ai-image-editor' },
    { label: 'Pricing', icon: <PriceChange sx={{ fontSize: 18 }} />, path: '/pricing' },
    { label: 'Admin Panel', icon: <AdminPanelSettings sx={{ fontSize: 18 }} />, path: '/admin-dashboard' },
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
    // Admin-specific gradient colors
    background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(58, 28, 113, 0.3)',
    '&:hover': {
        background: 'linear-gradient(135deg, #2d0e5e 0%, #b94e5e 50%, #e68a4a 100%)',
        boxShadow: '0 4px 16px rgba(58,28,113,0.12)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
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
    background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)',
    color: 'white',
    boxShadow: '0 4px 20px rgba(58, 28, 113, 0.3)',
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
        backgroundColor: alpha('#3a1c71', 0.08),
    },
    '&.Mui-selected': {
        backgroundColor: alpha('#3a1c71', 0.12),
        '&:hover': {
            backgroundColor: alpha('#3a1c71', 0.16),
        },
    },
}));

export default function AdminSplitButton() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(4); // Default to Admin Panel
    const theme = useTheme();
    const router = useRouter();

    const handleClick = () => {
        const selectedOption = options[selectedIndex];
        if (selectedOption.path === '/logout') {
            signOut({ callbackUrl: '/login' });
        } else {
            router.push(selectedOption.path);
        }
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);

        const selectedOption = options[index];
        if (selectedOption.path === '/logout') {
            signOut({ callbackUrl: '/login' });
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
                aria-label="Admin navigation menu"
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
                    aria-controls={open ? 'admin-split-button-menu' : undefined}
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
                                    id="admin-split-button-menu"
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
                                                color: option.path === '/logout' ? '#ef4444' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: option.path === '/logout' 
                                                        ? alpha('#ef4444', 0.08)
                                                        : alpha('#3a1c71', 0.08),
                                                },
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
