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
import { isAdmin } from '@/lib/adminAuth';
import {
    Dashboard,
    Home,
    AdminPanelSettings,
    Logout,
    PriceChange,
    PhotoLibrary,
    Article
} from '@mui/icons-material';

const UserSplitButton = ({ session }) => {
    // Dynamic options based on user role
    const getOptions = () => {
        const baseOptions = [
            { label: 'AI Studio', icon: <PhotoLibrary sx={{ fontSize: 18 }} />, path: '/ai-image-editor' },
            { label: 'Main Site', icon: <Home sx={{ fontSize: 18 }} />, path: '/' },
            { label: 'Gallery', icon: <PhotoLibrary sx={{ fontSize: 18 }} />, path: '/gallery' },
            { label: 'Pricing', icon: <PriceChange sx={{ fontSize: 18 }} />, path: '/pricing' },
            { label: 'Blog', icon: <Article sx={{ fontSize: 18 }} />, path: '/blog' }
        ];

        // Add admin panel option if user is admin
        if (isAdmin(session)) {
            baseOptions.push({ 
                label: 'Admin Panel', 
                icon: <AdminPanelSettings sx={{ fontSize: 18 }} />, 
                path: '/admin-dashboard' 
            });
        }

        baseOptions.push({ label: 'Sign Out', icon: <Logout sx={{ fontSize: 18 }} />, path: '/logout' });
        return baseOptions;
    };

    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0); // Default to AI Studio
    const theme = useTheme();
    const router = useRouter();
    const options = getOptions();

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
        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        '&:hover': {
            background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
            boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
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
        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
        '&:hover': {
            background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
            boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
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
            backgroundColor: alpha('#667eea', 0.08),
        },
        '&.Mui-selected': {
            backgroundColor: alpha('#667eea', 0.12),
            '&:hover': {
                backgroundColor: alpha('#667eea', 0.16),
            },
        },
    }));

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
                aria-label="User navigation menu"
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
                    aria-controls={open ? 'user-split-button-menu' : undefined}
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
                                    id="user-split-button-menu"
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
                                                color: option.path === '/logout' ? '#ef4444' : 
                                                       option.path === '/admin-dashboard' ? '#1976d2' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: option.path === '/logout' 
                                                        ? alpha('#ef4444', 0.08)
                                                        : option.path === '/admin-dashboard'
                                                        ? alpha('#1976d2', 0.08)
                                                        : alpha('#667eea', 0.08),
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
};

export default UserSplitButton;
