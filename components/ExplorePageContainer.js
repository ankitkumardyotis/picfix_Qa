import React from 'react'
import styles from '@/styles/Home.module.css'
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Container, Icon, Typography, useMediaQuery } from '@mui/material';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { useContext } from 'react';
import AppContext from './AppContext';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useInView } from 'react-intersection-observer';
import { Fade } from 'react-awesome-reveal';
function ExplorePageContainer(props) {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const router = useRouter();
    const context = useContext(AppContext);
    const { data: session } = useSession();

    const { ref, inView, entry } = useInView({
        triggerOnce: true,
        threshold: 0.1
    })


    const images = props.imagesPath
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Logic to update the current image index
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);
        return () => {
            clearInterval(interval); // Clean up the interval on component unmount
        };
    }, []);


    // const fetchUserPlan = async () => {
    //     try {
    //         const response = await fetch(`/api/getPlan?userId=${session?.user.id}`);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch plan data');
    //         }
    //         const data = await response.json();
    //         return data;
    //     } catch (error) {
    //         console.error('Error fetching plan data:', error);
    //     }
    // };

    const handleRunModelButton = async () => {

        if (!session) {
            localStorage.setItem("path", props.routePath)
            router.push('/login');
        } else {
            router.push(props.routePath)
            // For free use of remove background 
            // if (props.routePath == '/backgroundRemoval/runModel') {
            //     router.push('/backgroundRemoval/runModel')
            //     return;
            // }
            // const { plan } = await fetchUserPlan();
            // if (plan && plan.remainingPoints > 0) {
            //     router.push(props.routePath)
            // } else {
            //     router.push('price')
            // }
        }
    }


    return (
        // Outer Box
        <Container maxWidth='xl' ref={ref} sx={{ marginTop: matches ? '6em' : '5em', height: '100vh', paddingBottom: '10em', display: 'flex', alignItems: 'center' }}>
          
            {
                entry && <Fade direction='up' triggerOnce={true}>

                    < Box sx={{ display: 'flex', gap: matches ? '2em' : '', justifyContent: 'space-evenly' }}   >
                        {/* Left Box */}

                        < Box sx={{ width: matches ? '50%' : '100%', display: 'flex', flexDirection: 'column', gap: matches ? '3em' : '1.5em', marginTop: '-.3em' }} >
                            <Box>
                                <Typography variant={matches ? 'h3' : 'h4'} sx={{ lineHeight: '1em' }}><b>  {props.heading} </b> </Typography>
                            </Box>
                            <Box >
                                <Typography variant='body1' sx={{ fontSize: matches ? '20px' : '16px' }} >{props.description}</Typography>
                            </Box>
                            {
                                !matches &&
                                <Box>
                                    <Box className={styles.animatedImageContainer} sx={{ alignSelf: 'end' }}>
                                        {images[currentImageIndex] && images[currentImageIndex].includes('.mp4') 
                                            ? <video 
                                                src={images[currentImageIndex]} 
                                                autoPlay 
                                                loop 
                                                // controls
                                                style={{ width: '100%', height: 'auto', maxWidth: '1600px' }} 
                                              />
                                            : <Image src={images[currentImageIndex] || ""} alt="Content image" width={1600} height={900} />
                                        }
                                    </Box>
                                </Box>
                            }

                            <Box className={styles.explorePageButtons} sx={{ display: 'flex', flexDirection: matches ? 'row' : 'column-reverse', marginTop: matches ? '' : '1em' }} >
                                {/* <button>How it works</button> */}
                                <button onClick={handleRunModelButton}>{props.buttonTwoText}
                                </button>
                            </Box>
                        </Box >

                        {/* Right Box */}

                        < Box sx={{ width: matches ? '50%' : '', }}>
                            {
                                matches &&
                                <Box >
                                    <Box className={styles.animatedImageContainer} sx={{ paddingLeft: '50px' }}>
                                        {images[currentImageIndex] && images[currentImageIndex].includes('.mp4') ?
                                            <video 
                                                src={images[currentImageIndex]} 
                                                autoPlay 
                                                // muted 
                                                loop 
                                                // controls  
                                                style={{ width: '100%', height: 'auto', maxWidth: '1600px', borderRadius: '10px' }} 
                                            />
                                        :
                                            <Image src={images[currentImageIndex] || ""} alt="Content image" width={1600} height={900} />
                                        }
                                    </Box>
                                </Box>
                            }
                        </Box >

                    </Box >


                </Fade>
            }
        </Container >

    )
}

export default ExplorePageContainer