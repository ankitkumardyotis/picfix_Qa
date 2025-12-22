import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from 'next/head'
import LandingPage from '@/components/LandingPage';
import Script from 'next/script';
import PhotoAIHero from "@/components/updated_landing_page/Hero_section";
import ModelCards from "@/components/updated_landing_page/ModelCards";
import AIImageEditingSection from "@/components/updated_landing_page/AIImageEditingSection";
import MiniBlog from "@/components/updated_landing_page/MiniBlog";
import Gallery from "@/components/updated_landing_page/gallery";
import CTA from "@/components/updated_landing_page/CTA";

export default function Home({ open, setOpen }) {
  const { data: session } = useSession()
  const router = useRouter();

  
  return (
    <>

      <Head>
        {/* Primary Meta Tags */}
        <title>PicFix.AI - AI Photo Editor & Image Enhancement Tools | Free Online Photo Editing</title>
        <meta name="title" content="PicFix.AI - AI Photo Editor & Image Enhancement Tools | Free Online Photo Editing" />
        <meta name="description" content="Transform your photos with PicFix.AI's powerful AI tools. Free photo restoration, background removal, AI image generation, professional headshots, and 14+ AI models. No software download required - edit photos online instantly!" />
        <meta name="keywords" content="AI photo editor, photo enhancement, background removal, photo restoration, AI image generator, professional headshots, remove objects, hair style changer, home designer AI, text to video, watermark removal, online photo editor, free photo editing, image upscaler, photo quality enhancer, AI photo enhancer, remini alternative, photo editing tools, image editor online, photo retouching, picture enhancer, AI photo restoration, background remover, photo editor free, image enhancement, photo editing software, AI image editing, photo colorization, old photo restoration, blurry photo fix, photo quality improvement" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="author" content="PicFix.AI" />
        <meta name="copyright" content="© 2024 PicFix.AI. All rights reserved." />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="PicFix.AI" />
        <meta property="og:title" content="PicFix.AI - AI Photo Editor & Image Enhancement Tools | Free Online Photo Editing" />
        <meta property="og:description" content="Transform your photos with PicFix.AI's powerful AI tools. Free photo restoration, background removal, AI image generation, professional headshots, and 14+ AI models. No software download required!" />
        <meta property="og:url" content="https://www.picfix.ai/" />
        <meta property="og:image" content="https://www.picfix.ai/assets/logo.jpg" />
        <meta property="og:image:alt" content="PicFix.AI - AI Photo Editor Logo" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@PicFixAI" />
        <meta name="twitter:creator" content="@PicFixAI" />
        <meta name="twitter:title" content="PicFix.AI - AI Photo Editor & Image Enhancement Tools" />
        <meta name="twitter:description" content="Transform your photos with PicFix.AI's powerful AI tools. Free photo restoration, background removal, AI image generation, and 14+ AI models. Edit photos online instantly!" />
        <meta name="twitter:image" content="https://www.picfix.ai/assets/logo.jpg" />
        <meta name="twitter:image:alt" content="PicFix.AI - AI Photo Editor" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="theme-color" content="#3a1c71" />
        <meta name="msapplication-TileColor" content="#3a1c71" />
        <meta name="application-name" content="PicFix.AI" />
        <meta name="apple-mobile-web-app-title" content="PicFix.AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.picfix.ai/" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" sizes="16x16" />
        <link rel="apple-touch-icon" href="/assets/logo.jpg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picfixcdn.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PicFix.AI",
              "url": "https://www.picfix.ai",
              "logo": "https://www.picfix.ai/assets/logo.jpg",
              "description": "AI-powered photo editing and image enhancement platform with 14+ AI tools including photo restoration, background removal, and image generation.",
              "sameAs": [
                "https://twitter.com/PicFixAI",
                "https://www.facebook.com/PicFixAI"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            })
          }}
        />
        
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PicFix.AI",
              "url": "https://www.picfix.ai",
              "description": "AI-powered photo editing platform with free and premium tools for photo restoration, background removal, image generation, and more.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.picfix.ai/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "PicFix.AI Photo Editor",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web Browser",
              "description": "AI-powered online photo editor with 14+ AI models for photo restoration, background removal, image generation, professional headshots, and more.",
              "url": "https://www.picfix.ai",
              "screenshot": "https://www.picfix.ai/assets/logo.jpg",
              "softwareVersion": "2.0",
              "datePublished": "2024-01-01",
              "author": {
                "@type": "Organization",
                "name": "PicFix.AI"
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "description": "Free AI photo editing tools with premium options available"
              },
              "featureList": [
                "AI Photo Restoration",
                "Background Removal",
                "AI Image Generation",
                "Professional Headshots",
                "Object Removal",
                "Hair Style Changer",
                "Home Designer AI",
                "Text to Video",
                "Watermark Removal",
                "Image Enhancement",
                "Photo Colorization",
                "Re-imagine Scenarios",
                "Combine Images",
                "Text Removal"
              ]
            })
          }}
        />
        
        {/* Structured Data - FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is PicFix.AI?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PicFix.AI is an AI-powered online photo editing platform that offers 14+ AI models for photo enhancement, restoration, background removal, image generation, and more. It provides both free and premium tools accessible through any web browser."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is PicFix.AI free to use?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, PicFix.AI offers several free AI tools including photo restoration, background removal, home designer, and text-to-video. Premium features are available with credit-based pricing."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What file formats does PicFix.AI support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PicFix.AI supports commonly used image formats including JPEG, JPG, and PNG files."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use PicFix.AI for professional projects?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely! PicFix.AI provides professional-quality results suitable for designers, marketers, photographers, and businesses. The platform offers high-resolution outputs perfect for professional use."
                  }
                }
              ]
            })
          }}
        />
      </Head>
      <Script strategy="lazyOnload" async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`} />

      <Script
        id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}
        dangerouslySetInnerHTML={{
          __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}',{
          page_path: window.location.pathname,

        });
      `,
        }}
      />

      <main   >
        <PhotoAIHero/>
        <ModelCards/>
        <Gallery/>
        <MiniBlog/>
      </main>

  
    </>
  );
}







// <>
// {/* <CreditPlanCard/> */}
// <div className="outerContent" style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
//   <div className="innerContent" style={{ width: '50vw', position: 'relative', height: '50vh', backgroundColor: 'rgba(0,128,128,.1)', borderRadius: '20px', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//     {session && <div style={{ float: 'right', cursor: 'pointer', backgroundColor: 'teal', padding: '5px', color: '#ececec', borderRadius: '10px', top: 20, left: 0, position: 'absolute', transform: 'rotate(-33deg)' }} onClick={() => signOut()}>Sign Out  </div>}
//     <h1 style={{ color: 'black' }}>Prisma Auth setup</h1>
//     {/* Welcome user  */}
//     {session && <h3 style={{ color: 'black', marginTop: '10px', marginBottom: '30px' }}>Hi {session?.user?.name}, Welcome to Picfix.ai</h3>
//     }
//     <ul style={{ display: 'flex', flexDirection: 'row', justifyItems: 'center', alignItems: 'center', gap: '40px', marginTop: '20px', fontSize: '22px' }}>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/')}>Home</li>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/price')
//       }>Price</li>
//       <li style={{ listStyle: 'none', cursor: 'pointer' }} onClick={() =>
//         router.push('/login')
//       }>Sign In</li>
//     </ul>


//     {/* {
//       session && (
//         <>
//           <p>Signed in as {session.user.email}</p>
//           <img style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '20px' }} src={session.user.image} alt={session.user.name} />
//           <button style={{ width: '100px', height: '40px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => signOut()}>Sign out</button>
//         </>
//       )} */}

//     {/* {!session && <button style={{ width: '100px', height: '40px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => signIn()}>Sign in</button>} */}
//   </div>
// </div>
// </>
