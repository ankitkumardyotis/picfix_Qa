import styles from './../styles/Home.module.css'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Container, Icon } from '@mui/material';
import AllModelsContainer from './AllModelsContainer';
import CommunityGallery from './CommunityGallery';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ReactCompareImage from 'react-compare-image';
import { useEffect } from 'react';
import { useState } from 'react';
import { Typewriter } from 'react-simple-typewriter'
import Image from 'next/image';
import Head from 'next/head';
import HeroSection from './updated_landing_page/Hero_section';



function LandingPage() {
  // const [matchesToSetMediaQuery, setMatchesToSetMediaQuery] = useState(null)

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));
  const router = useRouter();

  // useEffect(() => {
  //   setMatchesToSetMediaQuery(matches)
  // }, [])

  const handleClickOpen = () => {
    router.push('/ai-image-editor ');
    localStorage.setItem('path', '/#All-AI-Models')
  };
  const images = ['/assets/image Colorization landing page  1600X900.jpg', '/assets/remove-background-banner.jpg', '/assets/restore photo landing page  1600X900.jpg'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Logic to update the current image index
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, []);
  const words = ['Introducing One-Click Photo Editing & Beyond using AI']


  // if (!matchesToSetMediaQuery) {
  //   return null
  // }

  return (
    <>
      <Head>
        <link rel="preload" href="/assets/banner-new.jpg" as="image" />
      </Head>
      <div className={styles.landingPage}>
        <div className={styles.landingPageImage}>

          <div className={styles.carouselOne}>
            <div style={{ display: 'flex', width: '100vw', height: '60%' }}>

              <div className={styles.landingPageContent} style={{ marginTop: matches ? '22.5vh' : '5em' }}>
                <h1>Introducing One-Click <br />  Photo Editing  & Beyond  <br />  </h1><span className={styles.gradientColor}>   <h1>
                  <Typewriter loop={false}
                    words={['using AI ', 'with Picfix']} />  </h1>  </span>
                <p>Transform your blurry, low-resolution images into stunning works of art with AI. Our advanced AI-powered algorithm takes care of everything from removing noise to enhancing sharpness and restoring lost details, all with just one click.</p>
                {
                  !matches &&
                  <div className={styles.animatedImageContainer}>
                    <Image priority={true} src={images[currentImageIndex]} alt="Girl blur image " width={1600} height={900} />
                  </div>
                }
                <button onClick={handleClickOpen}>Try Now</button>
              </div>
              {
                matches &&
                <div className={styles.compareSliderContainer}>
                  <div className={styles.animatedImageContainer}>
                    <Image priority={true} src={images[currentImageIndex]} alt="Girl blur image " width={1600} height={900} />
                  </div>
                </div>
              }
            </div>
          </div>


        </div>



      </div>


      {/* Creative AI Models Banner Section */}
      <div className={styles.aiModelsBanner}>
        {/* Floating Background Elements */}
        <div className={styles.floatingElements}>
          <div className={`${styles.floatingShape} ${styles.shape1}`}>✨</div>
          <div className={`${styles.floatingShape} ${styles.shape2}`}>🎯</div>
          <div className={`${styles.floatingShape} ${styles.shape3}`}>🚀</div>
          <div className={`${styles.floatingShape} ${styles.shape4}`}>💫</div>
          <div className={`${styles.floatingShape} ${styles.shape5}`}>⭐</div>
          <div className={`${styles.floatingShape} ${styles.shape6}`}>🎪</div>
        </div>

        {/* Animated Gradient Orbs */}
        <div className={styles.gradientOrbs}>
          <div className={`${styles.orb} ${styles.orb1}`}></div>
          <div className={`${styles.orb} ${styles.orb2}`}></div>
          <div className={`${styles.orb} ${styles.orb3}`}></div>
        </div>

        <div className={styles.bannerContainer}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerText}>
              <div className={styles.titleContainer}>
                <div className={styles.sparkleLeft}>✨</div>
                <h2 className={styles.bannerTitle}>
                  <span className={styles.gradientText}>Top 5</span>
                  <span className={styles.magicText}>AI Magic</span>
                  <span className={styles.glowText}>Tools</span>
                </h2>
                <div className={styles.sparkleRight}>✨</div>
              </div>
              <p className={styles.bannerSubtitle}>
                <span className={styles.typewriter}>Transform your creativity with AI-powered magic ✨</span>
              </p>
            </div>

            <div className={styles.modelsContainer}>
              <div className={styles.modelsRow}>
                <div className={`${styles.modelTag} ${styles.popular} ${styles.animateUp} ${styles.rotate1}`}>
                  <div className={styles.tagIcon}>📸</div>
                  <span>Photo Restoration</span>
                  <div className={styles.popularBadge}>🔥 Popular</div>
                  <div className={styles.shine}></div>
                </div>
                <div className={`${styles.modelTag} ${styles.animateUp} ${styles.delay1} ${styles.rotate2}`}>
                  <div className={styles.tagIcon}>🌈</div>
                  <span>Image Colorization</span>
                  <div className={styles.shine}></div>
                </div>
                <div className={`${styles.modelTag} ${styles.animateUp} ${styles.delay2} ${styles.rotate3}`}>
                  <div className={styles.tagIcon}>✂️</div>
                  <span>Background Removal</span>
                  <div className={styles.shine}></div>
                </div>
                <div className={`${styles.modelTag} ${styles.hot} ${styles.animateUp} ${styles.delay3} ${styles.rotate4}`}>
                  <div className={styles.tagIcon}>🎬</div>
                  <span>Text to Video</span>
                  <div className={styles.hotBadge}>🚀 Hot</div>
                  <div className={styles.shine}></div>
                </div>
                <div className={`${styles.modelTag} ${styles.new} ${styles.animateUp} ${styles.delay4} ${styles.rotate5}`}>
                  <div className={styles.tagIcon}>🎨</div>
                  <span>AI Image Generator</span>
                  <div className={styles.newBadge}>⚡ New</div>
                  <div className={styles.shine}></div>
                </div>
              </div>
            </div>

            <div className={styles.bannerCTA}>
              <button className={styles.exploreCTA} onClick={handleClickOpen}>
                <div className={styles.buttonContent}>
                  <span className={styles.buttonText}>Discover All 14+ Tools</span>
                  <div className={styles.buttonIcon}>
                    <ArrowOutwardIcon className={styles.ctaIcon} />
                  </div>
                </div>
                <div className={styles.buttonGlow}></div>
              </button>
              <div className={styles.ctaDecoration}>
                <span className={styles.decorText}>👆 Click to unleash creativity!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <div id='All-AI-Models' className={styles.blankSpace}>

      </div>

      <div className='allModelCards'>
        <AllModelsContainer />
      </div>

      {/* Community Gallery Section */}
      <div className='communityGallerySection'>
        <CommunityGallery />
      </div>

    </>
  )
}

export default LandingPage