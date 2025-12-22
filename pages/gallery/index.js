import React from 'react'
import CommunityGallery from '@/components/CommunityGallery'
import { Box, Container } from '@mui/material'

function index() {
    return (
        <Container sx={{

            backgroundColor: 'white',
            borderRadius: '10px',
            margin: '20px',
            overflow: 'hidden',
            marginTop: '5rem',
            mx: 'auto',
        }}>
            <CommunityGallery />
        </Container>
    )
}

export default index