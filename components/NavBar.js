import Link from 'next/link';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import AccountMenu from './AccountMenu';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { useState, useEffect } from 'react';
import { Box, Container, Menu, MenuItem, Typography, Fade } from '@mui/material';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BrushIcon from '@mui/icons-material/Brush';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RestoreIcon from '@mui/icons-material/Restore';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CombineIcon from '@mui/icons-material/Merge';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import HomeIcon from '@mui/icons-material/Home';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
// AI Models configuration
const aiModels = [
    {
        key: 'generate-image',
        name: 'AI Image Generator',
        icon: <AutoAwesomeIcon sx={{ fontSize: 18 }} />,
        description: 'Generate images from text prompts'
    },
    {
        key: 'hair-style',
        name: 'Hair Style Changer',
        icon: <BrushIcon sx={{ fontSize: 18 }} />,
        description: 'Change hairstyles and colors'
    },
    {
        key: 'headshot',
        name: 'Professional Headshot',
        icon: <PhotoCameraIcon sx={{ fontSize: 18 }} />,
        description: 'Create professional headshots'
    },
    {
        key: 'restore-image',
        name: 'Image Restoration',
        icon: <RestoreIcon sx={{ fontSize: 18 }} />,
        description: 'Restore and enhance old photos'
    },
    {
        key: 'text-removal',
        name: 'Text/Watermark Removal',
        icon: <TextFieldsIcon sx={{ fontSize: 18 }} />,
        description: 'Remove text and watermarks'
    },
    {
        key: 'reimagine',
        name: 'ReImagine Scenarios',
        icon: <PsychologyIcon sx={{ fontSize: 18 }} />,
        description: 'Create ReImagine Scenarios'
    },
    {
        key: 'combine-image',
        name: 'Image Combiner',
        icon: <CombineIcon sx={{ fontSize: 18 }} />,
        description: 'Combine multiple images'
    },
    {
        key: 'home-designer',
        name: 'Home Designer',
        icon: <HomeIcon sx={{ fontSize: 18 }} />,
        description: 'Design your dream home with AI'
    },
    {
        key: 'remove-background',
        name: 'Remove Background',
        icon: <RemoveRedEyeIcon sx={{ fontSize: 18 }} />,
        description: 'Remove background from images'
    },
    {
        key: 'object-removal',
        name: 'Object Removal',
        icon: <RemoveRedEyeIcon sx={{ fontSize: 18 }} />,
        description: 'Remove objects from images'
    },
    {
        key: 'upscale-image',
        name: 'Image Upscaler',
        icon: <ZoomInIcon sx={{ fontSize: 18 }} />,
        description: 'Enhance image resolution with AI'
    }

];

function NavBar({ open, setOpen }) {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const openDropdown = Boolean(anchorEl);

    // Check if we're on a page that should always have solid navbar
    const shouldAlwaysBeScrolled = router.pathname === '/ai-image-editor' || 
                                   router.pathname === '/admin-dashboard' || 
                                   router.pathname === '/dashboard' ||
                                   router.pathname === '/gallery' ||
                                   router.pathname === '/pricing' ||
                                   router.pathname.startsWith('/blog');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0 || shouldAlwaysBeScrolled);
        };

        // Set initial state
        setIsScrolled(shouldAlwaysBeScrolled);

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldAlwaysBeScrolled]);

    const handleDropdownOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleDropdownClose = () => {
        setAnchorEl(null);
    };

    const handleModelSelect = (modelKey) => {
        router.push(`/ai-image-editor?model=${modelKey}`);
        handleDropdownClose();
    };


    const imageStyle = {
        borderRadius: '5px',
    };


    return (
        <div className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <Container maxWidth="lg"  >
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'space-between',
                    padding: '0',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Logo */}
                    <div style={{ marginLeft: isMobile ? '-15px' : '0px', marginTop: isMobile ? '10px' : '4px' }}>
                        <Link href="/">
                            <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
                        </Link>
                    </div>

                    {/* Center Navigation Menu */}
                    {!isMobile && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}>
                            {/* AI Studio Dropdown */}
                            <Box
                                onMouseEnter={handleDropdownOpen}
                                onMouseLeave={handleDropdownClose}
                                sx={{ position: 'relative' }}
                            >
                                <Link href="/ai-image-editor" style={{ textDecoration: 'none' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            color: '#333',
                                            fontWeight: 600,
                                            fontSize: '18px',
                                            '.css-fmcy3k-MuiTypography-root': {
                                                fontSize: '14px',
                                                fontWeight: 600
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                color: '#667eea',
                                            }
                                        }}
                                    >
                                        <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            AI Studio
                                        </Typography>
                                        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                                    </Box>
                                </Link>

                                {/* Dropdown Menu */}
                                <Menu
                                    anchorEl={anchorEl}
                                    open={openDropdown}
                                    onClose={handleDropdownClose}
                                    TransitionComponent={Fade}
                                    MenuListProps={{
                                        onMouseLeave: handleDropdownClose,
                                    }}
                                    sx={{
                                        '& .MuiPaper-root': {
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                            border: '1px solid rgba(0,0,0,0.08)',
                                            minWidth: '320px',
                                            mt: 1,
                                        }
                                    }}
                                >


                                    {aiModels.
                                        filter((model) => model.name !== 'Background Removal')
                                        .map((model) => (
                                            <MenuItem
                                                key={model.key}
                                                onClick={() => handleModelSelect(model.key)}
                                                sx={{
                                                    px: 2,
                                                    py: 1.5,
                                                    gap: 1.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                                        '& .MuiTypography-root': {
                                                            color: '#ffa726',
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                    color: '#ffa726'
                                                }}>
                                                    {model.icon}
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                                                        {model.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#666', fontSize: '11px' }}>
                                                        {model.description}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                </Menu>
                            </Box>

                            {/* Price Link */}
                            <Link href="/pricing" style={{ textDecoration: 'none' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: '#333',
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        '.css-fmcy3k-MuiTypography-root': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            color: '#000',
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Pricing
                                    </Typography>
                                </Box>
                            </Link>
                            <Link href="/gallery" style={{ textDecoration: 'none' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: '#333',
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        '.css-fmcy3k-MuiTypography-root': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            color: '#000',
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Gallery
                                    </Typography>
                                </Box>
                            </Link>

                            {/* Blog Link */}
                            <Link href="/blog" style={{ textDecoration: 'none' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        color: '#333',
                                        fontWeight: 600,
                                        fontSize: '18px',
                                        '.css-fmcy3k-MuiTypography-root': {
                                            fontSize: '14px',
                                            fontWeight: 600
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            color: '#000',
                                        }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Blog
                                    </Typography>
                                </Box>
                            </Link>
                        </Box>
                    )}

                    {/* Account Menu */}
                    <div>
                        <AccountMenu />
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default NavBar;
