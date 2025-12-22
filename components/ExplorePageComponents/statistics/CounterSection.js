import React, { useEffect } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { Box, Container, Grid, Typography } from '@mui/material';
import { Fade } from 'react-awesome-reveal';
const CounterSection = () => {
    const stats = [
        { title: 'Image Generated', end: 2000 },
        { title: 'Happy Users', end: 500 },
        // { title: 'AI Models', end: 5 },
    ];

    const [ref, inView] = useInView({
        triggerOnce: true, // Trigger the animation only once
        threshold: 0.1,    // Trigger when 10% of the component is in view
    });
    useEffect(() => {

    }, [inView])


    return (
        <Box
            py={6}

            // className='outerContent'
            ref={ref}
        >
            {
                inView && <Fade direction="up">
                    <Container maxWidth="lg" >
                        <Typography variant="h3" fontWeight="bold" mb={6} align="center" gutterBottom>
                            Achievements
                        </Typography>
                        <Grid container spacing={4} justifyContent="center">
                            {stats.map((stat, index) => (
                                <Grid item xs={12} sm={6} md={3} key={index}>
                                    <Box textAlign="center">
                                        <Typography variant="h2" fontWeight='700' component="div">
                                            {inView && <CountUp end={stat.end} duration={2.5} />}+
                                        </Typography>
                                        <Typography variant="h5">{stat.title}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>

                </Fade>
            }
        </Box >
    );
};

export default CounterSection;
