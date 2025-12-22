import React, { useContext } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { Router, useRouter } from 'next/router'
import { CircularProgress } from '@mui/material'
import facebookIcon from '../../public/assets/socialLogin/facebook.png'
import googleIcon from '../../public/assets/socialLogin/search.png'
import githubIcon from '../../public/assets/socialLogin/github.png'
import Image from 'next/image'
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import AppContext from '@/components/AppContext'

function Home() {
    const { data: session, status } = useSession()
    const context = useContext(AppContext)
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const router = useRouter()


    if (typeof window !== 'undefined') {
        // Code that uses localStorage
        if (context.path) {
            localStorage.setItem("path", context.path)
        } else {
            const pathdata = localStorage.getItem('path');
            if (session) {
                if (pathdata) {
                    router.push(pathdata)
                } else {
                    router.push('/')
                }
            }
        }
    } else {
        console.log('localStorage is not available in this environment');
    }


    const styles = {
        socialBtn: {
            cursor: 'pointer', width: matches ? "60%" : '80%', height: '50px', borderRadius: '20px', border: '1px solid black', color: 'black', fontSize: '1.1em', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', fontWeight: '600', paddingLeft: '.5em', paddingRight: '1em'
        },
        btn: {
            cursor: 'pointer',
            width: '100px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'teal',
            color: 'white',
        }
    }

    return (
        <div style={{ width: '100vw', minHeight: '100vh', background: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)', display: 'flex', justifyContent: 'center', alignItems: 'center', }} >
            {status != 'loading' ?
                <div style={{ width: matches ? '70vw' : '90vw', height: matches ? '70vh' : 'vh', backgroundColor: 'white', borderRadius: '20px', display: 'flex', flexDirection: matches ? 'row' : 'column', justifyContent: 'center', alignItems: 'center', gap: matches ? '' : '2em', paddingTop: !matches && '1em', paddingBottom: !matches && '3em' }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        <h1 style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>Welcome To Picfix.ai</h1>
                        <p style={{ textAlign: 'center', textWrap: 'wrap', width: '80%', color: 'gray' }}>Log in to use our amazing AI tools for enhancing your photos. With just a click, turn your ordinary images into extraordinary ones!</p>
                    </div>
                    <div style={{ width: matches ? '5px' : '80%', borderRadius: '80%', height: matches ? '80%' : '5px', backgroundColor: 'teal' }}></div>

                    <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
                            <div style={styles.socialBtn} onClick={() => signIn("google")} > <Image width={30} height={30} src={googleIcon} alt="facebook icon" /> <p style={{ marginLeft: '1em' }}>Sign in with Google</p></div>
                            <div style={styles.socialBtn} onClick={() => signIn("github")}><Image width={30} height={30} src={githubIcon} alt="facebook icon" /> <p style={{ marginLeft: '1em' }}> Sign in with Github</p></div>
                            <div style={styles.socialBtn} onClick={() => signIn("facebook")}><Image width={30} height={30} src={facebookIcon} alt="facebook icon" /> <p style={{ marginLeft: '1em' }}> Sign in with Facebook</p></div>
                        </div>
                    </div>

                </div>
                :
                <div><CircularProgress /></div>
            }
        </div >
    )
}

export default Home