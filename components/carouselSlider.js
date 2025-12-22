import { Box, Container } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { Carousel } from 'react-responsive-carousel'

function CarouselSlider({beforeImageOne,afterImageOne,beforeImageTwo,afterImageTwo}) {

    return (
        <>
            <Carousel
                showArrows={true}
                autoPlay={true}
                infiniteLoop={true}
                // interval={10000}
                showThumbs={false}
                // preventMovementUntilSwipeScrollTolerance={true}
                // transitionTime={1000}
                showStatus={false}
                stopOnHover={true}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>

                    <Box sx={{ position: 'relative' }}>
                        <Image src={beforeImageOne} alt="Pic fix Carousel one" width={200} height={300} />
                        <span className="before-after-badge">Before</span>
                    </Box>

                    <Box sx={{ position: 'relative' }}>
                        <Image src={afterImageOne} alt="Pic fix Carousel one" width={200} height={300} />
                        <span className="before-after-badge">After</span>
                    </Box>

                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <Box sx={{ position: 'relative' }}>
                        <Image src={beforeImageTwo} alt="Pic fix Carousel one" width={200} height={300} />
                        <span className="before-after-badge">Before</span>
                    </Box>
                    <Box sx={{ position: 'relative' }}>
                        <Image src={afterImageTwo} alt="Pic fix Carousel one" width={200} height={300} />
                        <span className="before-after-badge">After</span>
                    </Box>
                </Box>
            </Carousel>
        </>
    )
}

export default CarouselSlider