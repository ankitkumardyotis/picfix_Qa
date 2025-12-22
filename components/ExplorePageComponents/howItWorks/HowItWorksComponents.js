
import { Box, Card, CardContent, Chip, Container, Grid, Paper, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useInView } from 'react-intersection-observer';
import { Fade } from "react-awesome-reveal";
function HowItWorksComponent({steps,modelName}) {
    
    const [ref, inView] = useInView({
        triggerOnce: true, // Trigger the animation only once
        threshold: 0.1,    // Trigger when 10% of the component is in view
    });
    return (

        <Box sx={{ minHeight: '100vh' }} className="outerContent" pt={4} pb={4} ref={ref}>

            <Container sx={{ mt: 4,mb:4 }}>
                {inView && <Fade direction="up" triggerOnce='true'>
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h1">How {modelName} works?</Typography>
                    </Box>
                </Fade>}
                {inView && <Fade direction='up' triggerOnce="true">
                    <Grid container spacing={4} mt={2}>
                        {steps.map((step, index) => (
                            <Grid item xs={12} sm={4} key={index}>
                                <Card sx={{ minHeight: '18rem', position: 'relative' }} className='wave-bg'>
                                    <CardContent className='wave-bg'>
                                        <Chip
                                            label={step.title}
                                            color="primary"
                                            sx={{ mb: 2, color: '#21645e', backgroundColor: '#a9e6d9' }}
                                        />
                                        <Typography variant="h2" gutterBottom>
                                            {step.heading}
                                        </Typography>
                                        <Typography variant="body1" >
                                            {step.description}
                                        </Typography>
                                        <Box sx={{ position: 'absolute', top: '0', right: '0', fontSize: '4rem', paddingRight: '1rem', fontWeight: '700', color: '#ced4da' }} >
                                            {step.id}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Fade>}
            </Container>

        </Box >
    )
}
export default HowItWorksComponent