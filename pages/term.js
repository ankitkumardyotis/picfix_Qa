import { Box, Container, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react'
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import Link from 'next/link';


function Term() {



    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Container maxWidth='md' sx={{ marginTop: '5em', minHeight: '100vh' }}>
            {/* <Box className='footerLogo' sx={{ display: 'flex', justifyContent: 'center' }} onClick={() => { router.push('/') }} >
                <Image src="/assets/PicFixAILogo.jpg" alt="logo" width={200} height={40} />
            </Box> */}
            <Typography variant={matches ? "h3" : "h4"} sx={{ textAlign: 'center' }}><b>Terms and Conditions </b> </Typography> <br /><br />
            <Typography variant="h5" ><b>1. Introduction</b> </Typography><br />
            <Typography variant="p" >Welcome to PicFix.ai. This website is owned and operated by  <Link target='_blank' href={'https://dyotis.com/'}>Dyotis Analytics PVT. LTD</Link> By visiting our website and accessing the information, resources, services, products, and tools we provide, you understand and agree to accept and adhere to the following terms and conditions.</Typography>

            <Typography mt={5} variant="h5" ><b> 2. Service Terms</b> </Typography><br />
            <Typography variant='p' mt={2}>PicFix.ai provides a range of AI-powered photo editing services, including but not limited to photo restoration, image colorization, background removal, trendy look application, and AI home makeover. By using these services, you agree to use them responsibly and not use them for any illegal or unethical purposes.</Typography>

            <Typography mt={5} variant="h5" ><b>3. User Responsibilities</b></Typography><br />
            <Typography variant='p'>As a user, you are responsible for the photos you upload to our website. You must have the necessary rights and permissions for any image you upload. PicFix.ai is not responsible for any copyright infringement caused by the images uploaded by users.
            </Typography>

            <Typography mt={5} variant="h5" ><b>4. Privacy</b></Typography><br />
            <Typography variant='p'>Your privacy is important to us. Please read our Privacy Policy to understand how we collect, use, and protect your personal information.
            </Typography>

            <Typography mt={5} variant="h5" ><b>5. Intellectual Property</b></Typography><br />
            <Typography variant='p'>The content on this website, including but not limited to text, graphics, and code, is the property of PicFix.ai and is protected by copyright laws. You may not use, copy, reproduce, or distribute our content without our express written consent.
            </Typography>

            <Typography mt={5} variant="h5" ><b>6. Limitation of Liability</b></Typography><br />
            <Typography variant='p'>PicFix.ai will not be liable for any direct, indirect, incidental, consequential, or exemplary loss or damages which may be incurred by you as a result of using our services, or as a result of any changes, data loss or corruption, cancellation, loss of access, or downtime.
            </Typography>


            <Typography mt={5} variant="h5" ><b>7. Changes to Terms</b></Typography><br />
            <Typography variant='p'>PicFix.ai reserves the right to modify these Terms and Conditions at any time without notice. Your continued use of our website after any such changes constitutes your acceptance of the new Terms and Conditions.
            </Typography>
            <Typography mt={5} variant="h5" ><b>8. Governing Law</b></Typography><br />
            <Typography variant='p'>This website is controlled by PicFix.ai. It can be accessed by most countries around the world. By accessing our website, you agree that the statutes and laws of our state, without regard to the conflict of laws and the United Nations Convention on the International Sales of Goods, will apply to all matters relating to the use of this website and the purchase of any products or services through this site.
            </Typography><br /> <br /> <br /><br />


        </Container >
    )
}

export default Term