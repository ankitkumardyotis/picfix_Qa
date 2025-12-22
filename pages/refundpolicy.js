import { Container, Typography } from '@mui/material'
import React from 'react'
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';


function Refund() {
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Container maxWidth='md' sx={{ marginTop: '5em', minHeight: '100vh' }}>

            <Typography variant={matches ? "h3" : "h4"} sx={{ textAlign: 'center' }}><b>Refund Policy</b> </Typography> <br /><br />
            <Typography variant="h5" ><b> Introduction</b> </Typography><br />
            <Typography variant="p" >Welcome to PicFix.ai. We strive to provide the best experience for our users, and we understand that circumstances may arise where a refund is necessary. Our refund policy is designed to be fair and transparent to both parties involved.
            </Typography>

            <Typography mt={5} variant="h5" ><b>Eligibility for Refund</b> </Typography><br />
            <Typography variant='p' mt={2}>You are eligible for a refund under the following conditions:
                <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                    <li>
                        <h3>Unused Credits:</h3>If you have purchased credits to access our models but have not used any credits from your account, you may request a refund.
                    </li>
                </ul>
            </Typography>

            <Typography mt={5} variant="h5"> <b>How to Request a Refund</b></Typography><br />
            <Typography mt={2} variant="p"> To request a refund, please follow these steps:

                <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                    <li>
                        <h3> Contact Support: </h3>  Reach out to our customer support team via email at     <Link href="mailto:software@dyotis.com"> software@dyotis.com</Link> with your refund request.

                    </li>
                    <li>
                        <h3> Provide Details:  </h3>
                        - Your full name <br />
                        - Email address associated with your account<br />
                        - Order ID or transaction ID <br />
                        - Reason for the refund request<br />

                    </li>
                </ul>
            </Typography>

            <Typography mt={2} variant="h5"><b> Verification:</b>
            </Typography><br />
            <Typography mt={2} variant="p">
                Our team will review your request and verify if you meet the eligibility criteria for a refund.
            </Typography>

            <Typography mt={2} variant="h5"><b> Processing Time:</b>
            </Typography><br />
            <Typography mt={2} variant="p">
                Refunds will be processed within 14 business days of approval.
            </Typography>
            <Typography mt={2} variant="h5"><b> Exceptions:</b>
            </Typography><br />
            <Typography mt={2} variant="p">
                Please note that the following situations are not eligible for a refund:
                <ul style={{ marginLeft: '3em', marginTop: '1em', lineHeight: '2em' }}>
                    <li>
                        If you have used any credits from your account to access our models.

                    </li>
                    <li>
                        If you have violated our terms of service or engaged in fraudulent activity.


                    </li>
                </ul>
            </Typography>


            <Typography mt={2} variant="h5"><b> Contact Us:</b>
            </Typography><br />
            <Typography mt={2} variant="p">
                If you have any questions or concerns regarding our refund policy, please feel free to contact us at
                <Link href="mailto:software@dyotis.com"> software@dyotis.com</Link>

                . We're here to assist you and ensure that you have a positive experience with our services.
            </Typography>
            <Typography mt={2} variant="h5"><b> Office :</b>
            </Typography><br />
            <Typography mt={2} variant="p">
                D-242, Unit No. G2, Sector 63, Noida, Uttar Pradesh - 201301
            </Typography>


























            <br /><br /><br /><br />



        </Container>
    )
}

export default Refund