import React from 'react'
import { Box, styled, alpha, FormControl, InputLabel, Select, MenuItem, Typography, Button, IconButton, CircularProgress, useTheme, useMediaQuery, TextField } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import modelConfigurations from '@/constant/ModelConfigurations';
import { Remove, Add, Dashboard, AccountBalanceRounded } from '@mui/icons-material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SplitButton from '../SplitButton';

function SidePanel({ aspectRatio, setAspectRatio, handleModelChange, selectedModel, handleSwitchModel, editImageModels, generateImageModels, combineImageModels, upscaleImageModels, restoreImageModels, switchedModel, setSwitchedModel, selectedHairColor, setSelectedHairColor, selectedGender, setSelectedGender, selectedHeadshotGender, setSelectedHeadshotGender, selectedHeadshotBackground, setSelectedHeadshotBackground, selectedReimagineGender, setSelectedReimagineGender, selectedScenario, setSelectedScenario, numOutputs, setNumOutputs, generatedImages, setGeneratedImages, isLoading, context, generateHairStyleImages, generateTextRemovalImage, generateHeadshotImage, generateRestoreImage, generateGfpRestoreImage, generateHomeDesignerImage, generateBackgroundRemovalImage, generateRemoveObjectImage, generateReimagineImage, generateCombineImages, generateUpscaleImage, generateFluxImages, uploadedImageUrl, textRemovalImageUrl, cartoonifyImageUrl, headshotImageUrl, restoreImageUrl, gfpRestoreImageUrl, homeDesignerImageUrl, backgroundRemovalImage, backgroundRemovalStatus, removeObjectImageUrl, reimagineImageUrl, combineImage1Url, combineImage2Url, inputPrompt, hasMaskDrawn, upscaleImageUrl, selectedVideoModel, setSelectedVideoModel, videoDuration, setVideoDuration, videoStartImageUrl, generateVideo, videoJobs, loadingVideoJobs, checkVideoStatus }) {

    const theme = useTheme();
    
    // Get the correct config based on selectedModel and switchedModel
    const getCurrentConfig = () => {
        // For upscale-image, get config from the specific upscale model variant
        if (selectedModel === 'upscale-image' && switchedModel) {
            // Map switchedModel to the correct configuration key
            const modelMapping = {
                'crystal-upscaler': 'upscale-image-crystal',
                'topaz-labs': 'upscale-image-topaz',
                'google-upscaler': 'upscale-image-google',
                'seedvr2': 'upscale-image-seedvr2'
            };
            const variantKey = modelMapping[switchedModel];
            return modelConfigurations[variantKey] || modelConfigurations[selectedModel] || {};
        }
        // For other models, use selectedModel directly
        return modelConfigurations[selectedModel] || {};
    };
    
    const currentConfig = getCurrentConfig();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const SidePanel = styled(Box)(({ theme }) => ({
        width: isMobile ? '100%' : '250px',
        background: isMobile ? 'transparent' : alpha(theme.palette.background.default, 0.5),
        backdropFilter: 'blur(10px)',
        borderRight: isMobile ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        padding: theme.spacing(1, isMobile ? 1 : 3),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        overflow: 'auto',
        boxShadow: isMobile ? 'none' : '4px 0 24px rgba(0,0,0,0.08)',
    }));


    const imageStyle = {
        borderRadius: '5px',
    };


    const getAspectRatioOptions = () => {
        if (selectedModel === 'hair-style' || selectedModel === 'combine-image' || selectedModel === 'home-designer' || selectedModel === 're-imagine') {
            return currentConfig.aspectRatios.map(ratio => {
                const labels = {
                    'match_input_image': 'Match Input Image',
                    '1:1': '1:1 Square',
                    '16:9': '16:9 Landscape',
                    '9:16': '9:16 Vertical',
                    '4:3': '4:3 Landscape',
                    '3:4': '3:4 Portrait',
                    '3:2': '3:2 Standard',
                    '2:3': '2:3 Portrait',
                    '4:5': '4:5 Portrait',
                    '5:4': '5:4 Landscape',
                    '21:9': '21:9 Ultrawide',
                    '9:21': '9:21 Vertical Ultrawide',
                    '2:1': '2:1 Wide',
                    '1:2': '1:2 Tall'
                };
                return { value: ratio, label: labels[ratio] || ratio };
            });
        }

        if (selectedModel === 'generate-video') {
            return [
                { value: '1:1', label: '1:1 Square' },
                { value: '16:9', label: '16:9 Landscape' },
                { value: '9:16', label: '9:16 Vertical' },
            ]
        }
        return [
            { value: '1:1', label: '1:1 Square' },
            { value: '16:9', label: '16:9 Landscape' },
            { value: '21:9', label: '21:9 Ultrawide' },
            { value: '3:2', label: '3:2 Standard' },
            { value: '2:3', label: '2:3 Portrait' },
            { value: '4:5', label: '4:5 Portrait' },
            { value: '5:4', label: '5:4 Landscape' },
            { value: '3:4', label: '3:4 Portrait' },
            { value: '4:3', label: '4:3 Landscape' },
            { value: '9:16', label: '9:16 Vertical' },
            { value: '9:21', label: '9:21 Vertical Ultrawide' }
        ];
    };

    return (

        < SidePanel >

            {/* Logo */}
            {!isMobile && < Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                <Link href="/">
                    <Image style={imageStyle} src="/assets/PicFixAILogo.jpg" alt="Logo" width={210} height={40} />
                </Link>
            </Box >}
            {/* Model Selection */}
            < FormControl fullWidth variant="outlined" >
                <InputLabel sx={{ fontSize: '14px', fontWeight: 400, }}>Select Model</InputLabel>
                <Select
                    value={selectedModel}
                    onChange={handleModelChange}
                    label="Select Model"
                    sx={{
                        borderRadius: 2,
                        '& .MuiSelect-select': {
                            padding: '.5rem',
                            // paddingLeft: '1rem',
                            fontSize: '12px',
                            fontWeight: 400,
                        },


                    }}
                >
                    {Object.entries(modelConfigurations)
                        .filter(([key, config]) => !isMobile || key !== 'background-removal')
                        .map(([key, config]) => (
                            // 
                            <MenuItem
                                key={key}
                                value={key}
                                sx={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    marginLeft: '-.5rem',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '40px',
                                                height: '12px',
                                                borderRadius: '10px',
                                                marginRight: '5px',
                                                paddingLeft: '-10px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                // opacity: 0,
                                                transform: 'translateX(10px)',
                                                transition: 'all 0.2s ease-in-out',
                                                ...(config.free ? {
                                                    backgroundColor: '#e8f5e8',
                                                    color: '#2e7d32',
                                                    // border: '1px solid #4caf50'
                                                } : {
                                                    backgroundColor: '#fff3e0',
                                                    color: '#f57c00',
                                                    // border: '1px solid #ff9800'
                                                })
                                            }}


                                        >
                                            {config.free ? 'Free' : 'Pro'}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 400 }}>
                                            {config.name}
                                        </Typography>
                                    </Box>
                                    {/* Free/Pro Label - Hidden by default, shown on hover */}

                                </Box>
                            </MenuItem>
                        ))}
                </Select>
            </FormControl >

            {
                (selectedModel === 'edit-image' || selectedModel === 'generate-image' || selectedModel === 'combine-image' || selectedModel === 'upscale-image' || selectedModel === 'restore-image') && (
                    < FormControl fullWidth variant="outlined" >
                        <InputLabel sx={{ fontSize: '14px', fontWeight: 400, }}>
                            {selectedModel === 'edit-image' ? 'Edit Image Model' : 
                             selectedModel === 'generate-image' ? 'Generate Image Model' : 
                             selectedModel === 'combine-image' ? 'Combine Image Model' :
                             selectedModel === 'restore-image' ? 'Restore Image Model' :
                             'Upscale Image Model'}
                        </InputLabel>
                        <Select
                            value={switchedModel || (selectedModel === 'edit-image' ? 'nano-banana' : 
                                                   selectedModel === 'generate-image' ? 'flux-schnell' : 
                                                   selectedModel === 'combine-image' ? 'flux-kontext-pro' :
                                                   selectedModel === 'restore-image' ? 'flux-restore' :
                                                   'crystal-upscaler')}
                            onChange={(e) => setSwitchedModel(e.target.value)}
                            label={selectedModel === 'edit-image' ? 'Edit Image Model' : 
                                   selectedModel === 'generate-image' ? 'Generate Image Model' : 
                                   selectedModel === 'combine-image' ? 'Combine Image Model' :
                                   selectedModel === 'restore-image' ? 'Restore Image Model' :
                                   'Upscale Image Model'}
                            sx={{
                                borderRadius: 2,
                                '& .MuiSelect-select': {
                                    // paddingLeft: '1.5rem',
                                    padding: ".5rem 1.5rem .5rem 1.5rem",
                                    fontSize: '12px',
                                    fontWeight: 400,
                                },


                            }}
                        >
                            {(selectedModel === 'edit-image' ? editImageModels : 
                              selectedModel === 'generate-image' ? generateImageModels : 
                              selectedModel === 'combine-image' ? combineImageModels :
                              selectedModel === 'restore-image' ? restoreImageModels :
                              upscaleImageModels).map((config, index) => (
                                <MenuItem
                                    key={config.model}
                                    value={config.model}
                                    sx={{
                                        fontSize: '12px',
                                        fontWeight: 400,
                                        marginLeft: '-.5rem',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 400 }}>
                                                {config.name}
                                            </Typography>
                                        </Box>
                                    
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                )
            }


            {/* Aspect Ratio - Side by side with Number of Outputs on mobile */}
            {selectedModel !== 'edit-image' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 'upscale-image' && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: isMobile ? 1 : 2
                }}>
                    {/* Aspect Ratio Control */}
                    <Box sx={{ flex: isMobile ? 1 : 'auto' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '12px', mb: .5 }}>
                            Aspect Ratio
                        </Typography>
                        <FormControl fullWidth variant="outlined">
                            <Select
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiSelect-select': {
                                        padding: '.5rem',
                                        fontSize: '12px',
                                        fontWeight: 400,
                                    },
                                }}
                            >
                                {getAspectRatioOptions().map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', marginLeft: '-1.5rem' }}>
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: option.value === '1:1' ? 16 : option.value === '16:9' ? 20 : option.value === '9:16' ? 10 :
                                                            option.value === '2:3' ? 12 : option.value === '3:4' ? 14 : option.value === '1:2' ? 10 :
                                                                option.value === '2:1' ? 20 : option.value === '4:5' ? 16 : option.value === '3:2' ? 18 : 16,
                                                        height: option.value === '1:1' ? 16 : option.value === '16:9' ? 11 : option.value === '9:16' ? 18 :
                                                            option.value === '2:3' ? 18 : option.value === '3:4' ? 18 : option.value === '1:2' ? 20 :
                                                                option.value === '2:1' ? 10 : option.value === '4:5' ? 20 : option.value === '3:2' ? 12 : 12,
                                                        borderRadius: 0.5,
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
                                                {option.label}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Number of Outputs - Side by side with Aspect Ratio on mobile */}
                    {/* {selectedModel !== 'edit-image' && selectedModel !== 'hair-style' && selectedModel !== 'combine-image' && selectedModel !== 'home-designer' && selectedModel !== 'background-removal' && selectedModel !== 'remove-object' && selectedModel !== 'text-removal' && selectedModel !== 'headshot' && selectedModel !== 'restore-image' && selectedModel !== 'gfp-restore' && selectedModel !== 're-imagine' && (
                        <Box sx={{ flex: isMobile ? 1 : 'auto' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500, fontSize: '12px', mb: .5 }}>
                                Number of Outputs
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    height: '40px', // Match the height of the Select component
                                }}
                            >
                                <IconButton
                                    onClick={() => {
                                        if (numOutputs > 1) {
                                            setNumOutputs(prev => prev - 1);
                                            setGeneratedImages(Array(numOutputs - 1).fill(null));
                                        }
                                    }}
                                    disabled={numOutputs <= 1}
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        },
                                        '&.Mui-disabled': {
                                            color: alpha(theme.palette.text.secondary, 0.3),
                                        }
                                    }}
                                >
                                    <Remove />
                                </IconButton>
                                <Box
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        px: 2,
                                        minWidth: '60px',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {numOutputs}
                                </Box>
                                <IconButton
                                    onClick={() => {
                                        if (numOutputs < 4) {
                                            setNumOutputs(prev => prev + 1);
                                            setGeneratedImages(Array(numOutputs + 1).fill(null));
                                        }
                                    }}
                                    disabled={numOutputs >= 4}
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        },
                                        '&.Mui-disabled': {
                                            color: alpha(theme.palette.text.secondary, 0.3),
                                        }
                                    }}
                                >
                                    <Add />
                                </IconButton>
                            </Box>
                        </Box>
                    )} */}
                </Box>
            )}

            {/* Hair Style Specific Sidebar Controls */}
            {
                selectedModel === 'hair-style' && (
                    <>
                        {/* Hair Color and Gender Selection - Side by side on mobile */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: isMobile ? 1 : 2
                        }}>
                            {/* Hair Color Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Hair Color</InputLabel>
                                <Select
                                    value={selectedHairColor}
                                    onChange={(e) => setSelectedHairColor(e.target.value)}
                                    label="Hair Color"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.hairColors.map((color, index) => (
                                        <MenuItem key={index} value={color} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {color}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Gender Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={selectedGender}
                                    onChange={(e) => setSelectedGender(e.target.value)}
                                    label="Gender"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.genders.map((gender, index) => (
                                        <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {gender}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </>
                )
            }
            {/* Headshot Specific Sidebar Controls */}
            {
                selectedModel === 'headshot' && (
                    <>
                        {/* Gender and Background Selection - Side by side on mobile */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: isMobile ? 1 : 2
                        }}>
                            {/* Gender Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={selectedHeadshotGender}
                                    onChange={(e) => setSelectedHeadshotGender(e.target.value)}
                                    label="Gender"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.genders.map((gender, index) => (
                                        <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {gender}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Background Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Background</InputLabel>
                                <Select
                                    value={selectedHeadshotBackground}
                                    onChange={(e) => setSelectedHeadshotBackground(e.target.value)}
                                    label="Background"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.backgrounds.map((background, index) => (
                                        <MenuItem key={index} value={background} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {background}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </>
                )
            }

            {/* ReImagine Specific Sidebar Controls */}
            {
                selectedModel === 're-imagine' && (
                    <>
                        {/* Gender and Scenario Selection - Side by side on mobile */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: isMobile ? 1 : 2
                        }}>
                            {/* Gender Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={selectedReimagineGender}
                                    onChange={(e) => setSelectedReimagineGender(e.target.value)}
                                    label="Gender"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.genders.map((gender, index) => (
                                        <MenuItem key={index} value={gender} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {gender}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Reimagine Yourself</InputLabel>
                                <Select
                                    value={selectedScenario}
                                    onChange={(e) => setSelectedScenario(e.target.value)}
                                    label="Reimagine Yourself"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.scenarios.map((scenario, index) => (
                                        <MenuItem key={index} value={scenario} sx={{ fontSize: '12px', fontWeight: 400, }}>
                                            {scenario}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </>
                )
            }

            {/* Video Generation Specific Sidebar Controls */}
            {
                selectedModel === 'generate-video' && (
                    <>
                        {/* Video Model Selection */}
                        <FormControl fullWidth variant="outlined">
                            <InputLabel sx={{ fontSize: '14px', fontWeight: 400 }}>Video Model</InputLabel>
                            <Select
                                value={selectedVideoModel}
                                onChange={(e) => setSelectedVideoModel(e.target.value)}
                                label="Video Model"
                                sx={{
                                    borderRadius: 2,
                                    '& .MuiSelect-select': {
                                        padding: '.5rem',
                                        paddingLeft: '1rem',
                                        fontSize: '12px',
                                        fontWeight: 400,
                                    },
                                }}
                            >
                                {currentConfig.models?.map((model) => (
                                    <MenuItem key={model.id} value={model.id} sx={{ fontSize: '12px', fontWeight: 400 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 500 }}>
                                                {model.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontSize: '10px', color: 'text.secondary' }}>
                                                {model.description}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Duration and Aspect Ratio - Side by side */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: isMobile ? 'row' : 'column',
                            gap: isMobile ? 1 : 2
                        }}>
                            {/* Duration Selection */}
                            <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Duration (seconds)</InputLabel>
                                <Select
                                    value={videoDuration}
                                    onChange={(e) => setVideoDuration(e.target.value)}
                                    label="Duration (seconds)"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.durations?.map((duration) => (
                                        <MenuItem key={duration} value={duration} sx={{ fontSize: '12px', fontWeight: 400 }}>
                                            {duration}s
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Aspect Ratio Selection */}
                            {/* <FormControl fullWidth={!isMobile} sx={{ flex: isMobile ? 1 : 'auto' }} variant="outlined">
                                <InputLabel>Aspect Ratio</InputLabel>
                                <Select
                                    value={aspectRatio}
                                    onChange={(e) => setAspectRatio(e.target.value)}
                                    label="Aspect Ratio"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiSelect-select': {
                                            padding: '.5rem',
                                            paddingLeft: '1rem',
                                            fontSize: '12px',
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    {currentConfig.aspectRatios?.map((ratio) => (
                                        <MenuItem key={ratio} value={ratio} sx={{ fontSize: '12px', fontWeight: 400 }}>
                                            {ratio}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                        </Box>

                        {/* Start Image Preview */}
                        {/* {videoStartImageUrl && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 500 }}>
                                    Start Image:
                                </Typography>
                                <Box sx={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    height: 120, 
                                    borderRadius: 2, 
                                    overflow: 'hidden',
                                    border: '1px solid rgba(0,0,0,0.1)'
                                }}>
                                    <img 
                                        src={videoStartImageUrl} 
                                        alt="Start frame" 
                                        style={{ 
                                            width: '100%', 
                                            height: '100%', 
                                            objectFit: 'cover' 
                                        }} 
                                    />
                                </Box>
                            </Box>
                        )} */}

                        {/* Video Jobs Status */}
                        {/* {videoJobs && videoJobs.length > 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 500 }}>
                                    Recent Video Jobs:
                                </Typography>
                                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                                    {videoJobs.slice(0, 3).map((job) => (
                                        <Box 
                                            key={job.id} 
                                            sx={{ 
                                                p: 1, 
                                                border: '1px solid rgba(0,0,0,0.1)', 
                                                borderRadius: 1, 
                                                mb: 1,
                                                backgroundColor: job.status === 'succeeded' ? 'rgba(76, 175, 80, 0.1)' : 
                                                                job.status === 'failed' ? 'rgba(244, 67, 54, 0.1)' : 
                                                                'rgba(255, 193, 7, 0.1)'
                                            }}
                                        >
                                            <Typography variant="caption" sx={{ fontSize: '10px', display: 'block' }}>
                                                {job.prompt?.substring(0, 30)}...
                                            </Typography>
                                            <Typography variant="caption" sx={{ 
                                                fontSize: '10px', 
                                                color: job.status === 'succeeded' ? 'success.main' : 
                                                       job.status === 'failed' ? 'error.main' : 'warning.main',
                                                fontWeight: 500
                                            }}>
                                                {job.status === 'running' ? 'Generating...' : 
                                                 job.status === 'succeeded' ? 'Completed' : 
                                                 job.status === 'failed' ? 'Failed' : job.status}
                                            </Typography>
                                            {job.status === 'running' && (
                                                <Button 
                                                    size="small" 
                                                    onClick={() => checkVideoStatus(job.id)}
                                                    sx={{ fontSize: '10px', p: 0.5, minWidth: 'auto' }}
                                                >
                                                    Check Status
                                                </Button>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )} */}
                    </>
                )
            }

            {/* Show credit according to the model */}

            {/* Additional Settings */}
            {!isMobile && < Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>

                <Box sx={{}}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
                        {currentConfig.creditCost !== 0 ? `Per run cost: ${currentConfig.creditCost * numOutputs}` : 'This model is free to use.'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center' }}>
                        Credits remaining: {context.creditPoints}
                    </Typography>

                    {/* Only show daily usage for users without plans (when creditPoints is 0) */}
                    {context.dailyUsage && context.creditPoints === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    textAlign: 'center',
                                    color: context.dailyUsage.canUseService ? 'success.main' : 'error.main',
                                    fontWeight: 500
                                }}
                            >

                                Daily: {context.dailyUsage.remainingCredits}
                            </Typography>
                            {context.dailyUsage.resetTimeFormatted && (
                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
                                    Resets: {context.dailyUsage.resetTimeFormatted}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>


                {/* <Button
                    fullWidth
                    variant="contained"
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    disabled={isLoading}
                    sx={{
                        borderRadius: 3,
                        py: 1,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '.8rem',
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 30px rgba(102, 126, 234, 0.4)',
                        },
                        '&.Mui-disabled': {
                            background: theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled,
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    {isLoading ? 'Processing...' :
                        "Generate Image"}   </Button> */}

                <SplitButton />

            </Box>}
            {/*Button with dropdown to navigate from editor to dashboard */}
            {/* <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button 
                sx={{
                    borderRadius: 3,
                    py: 1,
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '.8rem',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                }}
                startIcon={<AccountBalanceRounded />}
                onClick={() => router.push('/dashboard')}>
                    Dashboard
                </Button>
            </Box> */}
        </SidePanel >

    )
}

export default SidePanel

