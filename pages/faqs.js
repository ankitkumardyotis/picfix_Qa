import { Box, Container, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Link from 'next/link';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
    aiHomeMakeoverFaqContent, 
    removeBackgroundFaqContent, 
    restorePhotoFaqContent, 
    removeObjectFaqContent, 
    imageColorizationFaqContent,
    generalAiImageEditingFaqContent, 
    faqData
} from '../data/FaqData';


function Faqs() {

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    return (
        <Container maxWidth='md' sx={{ marginTop: '5em', minHeight: '100vh', mb: 8 }}>
            <Typography variant='h4' sx={{ textAlign: 'center', fontWeight: 'bold', mb: 5 }}>
                Frequently Asked Questions
            </Typography>

            {faqData.map((faq, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel${index}-content`}
                            id={`panel${index}-header`}
                            >
                            <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography sx={{ whiteSpace: 'pre-line' }}>{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            ))}
        </Container>
    )
}

export default Faqs

