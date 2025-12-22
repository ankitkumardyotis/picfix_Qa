import { Box, Divider, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'

import successIcon from '../../public/assets/success_icon.gif'
// import successIcon from '../public/assets/success_icon.gif'

function PaymentSuccessComponent({ status, amount, planName, currency, transactionId, email, creditPoints, date }) {
    return (
        <Box
            // m=".rem"
            display='flex'
            justifyContent='center'
            flexDirection='column'
            alignItems='center'
        // minHeight="90vh"
        >
            <Box
                className="bg-glow"
                boxShadow={2}
                borderRadius={8}
                p={3}
                bgcolor="white"
                maxWidth={500}
                mx="auto"
                textAlign="left"
            >

                <Box display='flex' justifyContent='center' alignItems='center' mb={1} >
                    <Image src="/assets/PicFixAILogo.jpg" width={300} height={50} style={{ borderRadius: '5px' }} />
                </Box>
                {/* <Typography variant="h5" gutterBottom>
                    Thank you for purchasing...
                </Typography> */}
                <Divider />
                <Typography mt={2} variant="body1" paragraph>
                    <strong>Transaction ID:</strong> {transactionId}
                </Typography>

                {email && <Typography variant="body1" paragraph>
                    <strong>E-mail:</strong> {email}
                </Typography>}

                {currency && <Typography variant="body1" paragraph>
                    <strong>Currency :</strong> {currency}
                </Typography>}
                <Typography variant="body1" paragraph>
                    <strong>Status :</strong> {status}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Amount:</strong> {amount}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Credit Points:</strong> {creditPoints}
                </Typography>
                <Typography variant="body1" paragraph textTransform='capitalize'>
                    <strong >Plan Name:</strong> {planName}
                </Typography>
                <Typography variant="body1" paragraph>
                    <strong>Payment Date:</strong> {date}
                </Typography>
                <Divider />
                <Typography variant="body2" mt={2} color="textSecondary">
                    For any inquiries, please contact software@dyotis.com <br />
                </Typography>
            </Box>
            {/* <Box mt={2}>
        <Button variant="contained" color="info"  sx={{border:'1px solid black', backgroundColor: 'black', color: 'white' }}>Explore Your First Model</Button>
    </Box> */}
        </Box>
    )
}

export default PaymentSuccessComponent