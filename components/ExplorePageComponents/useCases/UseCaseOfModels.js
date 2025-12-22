import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer';
import { Fade } from 'react-awesome-reveal';
import { Box, Button, Card, CardActions, CardContent, Chip, Container, Grid, Paper, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';


const TabPanel = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
};


function UseCaseOfModels({ useCaseData, titleAndDescriptionUseCase }) {


    const [activeTab, setActiveTab] = useState(0);
    const [autoSwitch, setAutoSwitch] = useState(true);
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    useEffect(() => {
        let count = 0;
        const intervalId = setInterval(() => {
            if (autoSwitch) {
                setActiveTab((prevActiveTab) => (prevActiveTab < useCaseData.length - 1 ? prevActiveTab + 1 : 0));
            }
        }, 3000);

        return () => clearInterval(intervalId); // Cleanup the interval on component unmount
    }, [autoSwitch]);

    const handleChange = (event, newValue) => {
        setAutoSwitch(false);
        setActiveTab(newValue);
    };

    return (
        <Container sx={{ mt: 8,mb:8, minHeight: '110vh' }} ref={ref}>
            <section>
                <Container maxWidth="lg">
                    {inView && <Fade direction='up'>

                        <Typography variant="h1" align="center" gutterBottom>
                            {titleAndDescriptionUseCase[0].title}
                        </Typography>
                        <Typography variant="subtitle1" align="center" paragraph mb={4}>
                            {titleAndDescriptionUseCase[0].description}
                        </Typography>
                    </Fade>}
                    <Tabs
                        value={activeTab}
                        onChange={handleChange}
                        centered
                        indicatorColor="red"
                        textColor="red"
                        variant="fullWidth"
                        style={{ marginBottom: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '2px solid #faefda' }}
                    >
                        {useCaseData.map((step, index) => (
                            <Tab
                                label={step.id}
                                key={step.id}
                                sx={{
                                    ".Mui-selected": {
                                        color: 'teal',
                                        color: 'black',
                                    },
                                    fontWeight: activeTab === index ? 'bold' : 'normal',
                                    textDecorationColor: activeTab === index ? '#555' : 'transparent',
                                    backgroundColor: activeTab === index ? '#d4f3eb' : 'transparent',
                                    borderRadius: '8px',
                                }}

                            />
                        ))}
                    </Tabs>
                    {useCaseData.map((step, index) => (
                        <TabPanel value={activeTab} index={index} key={step.id}>
                            <Box display='flex' bgcolor='#d4f3eb' borderRadius='10px' minHeight='60vh' flexDirection={matches ? 'row' : 'column'} justifyContent='center' alignItems='center'>
                                <Box sx={{ flex: 1, p: '2rem', pl: matches ? '4rem' : '2rem', pr: matches ? '4rem' : '2rem' }}>
                                    <Typography variant='h6' fontWeight='550'>
                                        {step.title}
                                    </Typography>
                                    <Typography variant="body1" mt={3}>
                                        {step.content}
                                    </Typography>
                                    {/* <Typography variant="body1" mt={1}>
                                {step.description}
                                </Typography> */}
                                </Box>
                                <Box sx={{ flex: 1, p: '2rem', pl: matches ? '4rem' : '2rem' }}>
                                    <img src={step.image} alt={step.title} style={{ width: '100%', borderRadius: '8px' }} />
                                </Box>
                            </Box>
                        </TabPanel>
                    ))}
                </Container>
            </section>
        </Container>
    )
}

export default UseCaseOfModels