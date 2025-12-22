import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import '@/styles/globals.css'
import { useEffect, useMemo, useState } from 'react';
import AppContext from '@/components/AppContext';
import Footer from '@/components/Footer';
import Script from "next/script";
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { SnackbarProvider } from "notistack";
import { useRouter } from "next/router";

export default function App({
  Component,
  pageProps: { session, ...pageProps },

}) {
  const [fileUrl, setFileUrl] = useState('');
  const [path, setPath] = useState('')
  const [open, setOpen] = useState(false);
  const [removeImageFromTransformerJs, setRemoveImageFromTransformerJs] = useState('');
  const [timerForRunModel, setTimerForRunModel] = useState(0)
  const [creditPoints, setCreditPoints] = useState(0)
  const [dailyUsage, setDailyUsage] = useState(null)

  const router = useRouter()

  const isMobile = useMediaQuery('(max-width: 600px)');

  const theme = createTheme({
    // palette: {
    //   primary: {
    //     main: '#6200ea',
    //   },
    //   secondary: {
    //     main: '#03a9f4',
    //   },
    // },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h1: {
        fontWeight: 600,
        marginBottom: '1rem',
        fontSize: '2.25rem',
      },
      h2: {
        fontWeight: 500,
        fontSize: '1.5rem',
      },
      body1: {
        fontSize: '1rem',
        // color: '#6b7280',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            padding: '1.5rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '0.5rem',
          },
        },
      },
    },
  });
  
  // Google Analytics 4: track client-side route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('config', 'G-SP5ZHMLMCR', {
          page_path: url,
        });
      }
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <SessionProvider session={session}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{
            vertical: isMobile ? 'top' : 'bottom',
            horizontal: isMobile ? 'center' : 'right',
          }}
          autoHideDuration={3000}
        >
          <ThemeProvider theme={theme}>
            <AppContext.Provider value={{ fileUrl, setFileUrl, path, setPath, removeImageFromTransformerJs, timerForRunModel, setTimerForRunModel, setRemoveImageFromTransformerJs, creditPoints, setCreditPoints, dailyUsage, setDailyUsage }}>
              {router.pathname != '/ai-image-editor' && router.pathname != '/admin-dashboard' && router.pathname != '/dashboard' && < NavBar open={open} setOpen={setOpen} creditPoints={creditPoints} setCreditPoints={setCreditPoints} />
              }
              {isMobile && <NavBar open={open} setOpen={setOpen} creditPoints={creditPoints} setCreditPoints={setCreditPoints} />}
              {useMemo(() => <Component {...pageProps} />, [fileUrl,
                path,
                open,
                removeImageFromTransformerJs,
                pageProps,
                timerForRunModel])}
              {router.pathname != '/ai-image-editor' && router.pathname != '/admin-dashboard' && router.pathname != '/dashboard' && router.pathname != '/gallery' && <Footer />}
            </AppContext.Provider>
          </ThemeProvider>
          {/* Google Analytics 4 */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-SP5ZHMLMCR`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{
            `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-SP5ZHMLMCR', { page_path: window.location.pathname });
            `
          }</Script>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </SnackbarProvider>
      </SessionProvider >

    </>
  )
}