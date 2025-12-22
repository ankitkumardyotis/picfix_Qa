"use client"

import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Container,
    Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Add, Remove } from '@mui/icons-material';


export default function FAQ({ faqContent }) {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" component="h2" gutterBottom>
                    Frequently Asked Questions
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Everything you need to know about PicFix.AI photo enhancement
                </Typography>
            </Box>

            {faqContent.map((faq, index) => (
                <Accordion
                    key={index}
                    borderRadius={10}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                >
                    <AccordionSummary
                        expandIcon={expanded === `panel${index}` ? <Remove /> : <Add />}
                        aria-controls={`panel${index + 1}-content`}
                        id={`panel${index + 1}-header`}
                    >
                        <Typography color="text.primary">{faq.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pl: 4, pr: 6, mt:-2}}>
                        <Typography>{faq.answer}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Container>
    );
}

