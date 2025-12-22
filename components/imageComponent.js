import React from 'react'
import ToggleButtonContainer from './toggleButtonContainer';
import UploaderComponent from './uploaderComponent';
import OriginalImage from './originalImage';
import { Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import ReactConfetti from 'react-confetti';
import ReactCompareImage from 'react-compare-image';
import { useContext, useRef, useEffect, useState } from "react";
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import axios from 'axios';
import AppContext from "@/components/AppContext";
import ImageStrip from './ImageStrip';
import JSZip from 'jszip';
import useWindowSize from 'react-use/lib/useWindowSize'
import { useRouter } from 'next/router';
import CircularWithValueLabel from './CircularProgressWithLabel';

function ImageComponent(props) {
    const confetiRef = useRef(null);
    const context = useContext(AppContext);
    const router = useRouter();
    // for mui responsive for uploader in mobile view
    const theme = useTheme();
    // const matches = useMediaQuery((theme)=>theme.breakpoints.down('md'));
    const matches = useMediaQuery(theme.breakpoints.down('md').replace(/^@media( ?)/m, '')) ?? false
    const { width, height } = useWindowSize();
    const [toggleClick, setToggleClick] = useState(false);
    const [originalImageHeight, setOriginalImageHieght] = useState(0);
    const [originalImageWidth, setOriginalImageWidth] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [restoreImageCompleteLoaded, setRestoreImageCompleteLoaded] = useState(false);


    useEffect(() => {
        if (matches) {
            setToggleClick(true);
        }
    }, [matches]);



    //  DownLoad Images with Zip if multiple images available

    const handleDownloadFile = async () => {
        // Define an array of image URLs
        let imageUrls = [props.restoredPhoto, props.imageColorization, props.imageColorizationOne, props.imageColorizationTwo, props.imageColorizationThree, props.imageColorizationFour, props.restoreImageURLForVarient];

        // Filter out undefined values from the imageUrls array
        const filteredUrls = imageUrls.filter(url => url !== undefined);

        // Check if there are multiple images
        if (filteredUrls.length > 1) {
            // Create an array of promises to download each image through our API
            const downloadPromises = filteredUrls.map(async (imageUrl, index) => {
                try {
                    const filename = `image${index + 1}.jpg`;
                    const response = await fetch(`/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`);
                    if (!response.ok) {
                        throw new Error(`Failed to download image ${index + 1}`);
                    }
                    return await response.blob();
                } catch (error) {
                    console.error(`Error downloading image ${index + 1}:`, error);
                    return null;
                }
            });

            try {
                // Wait for all the download promises to resolve
                const blobs = await Promise.all(downloadPromises);
                const validBlobs = blobs.filter(blob => blob !== null);

                if (validBlobs.length === 0) {
                    console.error('No images could be downloaded.');
                    return;
                }

                // Create a new instance of JSZip
                const zip = new JSZip();

                // Add images to zip
                validBlobs.forEach((blob, index) => {
                    zip.file(`image${index + 1}.jpg`, blob);
                });

                // Generate the zip folder
                const content = await zip.generateAsync({ type: 'blob' });

                // Create a link element to trigger the download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'images.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error creating zip folder:', error);
            }
        } else if (filteredUrls.length === 1) {
            // Download the single image through our API
            const imageUrl = filteredUrls[0];
            const filename = 'image.jpg';

            try {
                const response = await fetch(`/api/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`);
                if (!response.ok) {
                    throw new Error('Failed to download image');
                }

                // Create a link element to trigger the download
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        } else {
            console.error('No valid image URLs found.');
        }
    };



    return (
        <>
            <div className="flex-container flex-column">
                <div className="flex-container">
                    {props.fileUrl && (
                        <div style={{ visibility: !props.restoredPhoto ? "hidden" : "visible" }}>
                            {!props.restoredPhoto || (
                                <ToggleButtonContainer
                                    setToggleClick={setToggleClick}
                                    toggleClick={toggleClick}
                                    matches={matches}
                                />
                            )}
                        </div>
                    )}
                    {/* {!props.fileUrl && (
                        <div className="uploader-custom-border">
                            <UploaderComponent cropUploadedImage={props.cropUploadedImage} />
                        </div>
                    )} */}
                </div>

                {toggleClick === false ? (
                    <>
                        {props.fileUrl && (
                            <div
                                className="imageContainer box-container"
                                ref={confetiRef}
                                style={{ position: "relative", overflow: 'hidden' }}
                            >
                                {restoreImageCompleteLoaded && props.restoredPhoto && (
                                    <ReactConfetti
                                        maxHeight={originalImageHeight}
                                        width={width}
                                        height={height}
                                        numberOfPieces={500}
                                        recycle={false}
                                        gravity={0.3}
                                        initialVelocityY={15}
                                    />
                                )}
                                {props.fileUrl && (
                                    <div id="uploadedImage" className="originalImage" style={{ position: 'relative' }}>
                                        <OriginalImage
                                            setOriginalImageHieght={setOriginalImageHieght}
                                            setOriginalImageWidth={setOriginalImageWidth}
                                            setIsImageLoaded={setIsImageLoaded}
                                        />
                                        {!matches && <span className="before-after-badge">Before</span>}
                                    </div>
                                )}
                                <div style={{ border: "2px solid black", height: { height }, opacity: "4%" }}></div>

                                <div className="restoredImageContainer" style={props.fileUrl &&
                                    props.loading === false &&
                                    !props.restoredPhoto && matches &&
                                    originalImageHeight
                                    ? { border: "2px dotted black", borderRadius: "5px" }
                                    : null
                                }
                                >

                                    {props.loading === true && props.error === null ? (
                                        <div
                                            style={!matches ? {
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                                            } : { display: "flex", justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            {" "}
                                            {/* <CircularProgress color="inherit" /> */}
                                            <CircularWithValueLabel />
                                        </div>
                                    ) : (!props.restoredPhoto && props.loadCircularProgress === true &&
                                        <div
                                            style={!matches ? {
                                                display: "flex",
                                                justifyContent: "center",
                                                flexDirection: 'column',
                                                alignItems: "center",
                                                gap: '20px',
                                                height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                                            } : { display: "flex", justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <p style={{ fontSize: '80px' }}>😭</p>
                                            <h1>Server is busy.
                                                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                    onClick={() => {
                                                        props.setFileUrl(''),
                                                            props.setRestoredPhoto(''),
                                                            props.setLoadCircularProgress(false)
                                                        props.setLoading(false)
                                                        props.setError(null)
                                                        router.push('#ClickToUp')

                                                    }}>Please Retry
                                                </span>
                                            </h1>
                                        </div>
                                    )}

                                    <div className="restoredImage" style={{ position: 'relative' }}>
                                        <Image
                                            src={props.restoredPhoto}
                                            alt="Restored Image"
                                            referrerPolicy="no-referrer"
                                            onLoadingComplete={(e) => {
                                                setRestoreImageCompleteLoaded(true);
                                            }}
                                            style={{
                                                borderRadius: "5px",
                                                width: "100%",
                                                height: "100%",
                                                display: !props.restoredPhoto && "none",
                                                order: 2,
                                            }}
                                            width={400}
                                            height={200}
                                        />
                                        {props.restoredPhoto && !matches && <span className="before-after-badge">After</span>}
                                    </div>
                                </div>

                            </div>
                        )}

                    </>
                ) : (props.restoredPhoto && props.fileUrl ?

                    <Box
                        maxWidth="sm"
                        sx={{
                            margin: "1em",
                            height: '100%',
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            boxShadow: " 0 2px 10px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        {props.fileUrl && (
                            <Box sx={{ width: '100%',minWidth:'40vw', height: '100%' }}>
                                <ReactCompareImage leftImageLabel='before' leftImage={props.fileUrl} rightImageLabel='after' rightImage={props.restoredPhoto} />
                            </Box>
                        )}

                    </Box>
                    :
                    props.loading === true && props.error === null ? (
                        <div
                            style={matches ? {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: originalImageHeight ? originalImageHeight : "100%",
                            } : { display: "flex", justifyContent: 'center' }}
                        >
                            {" "}
                            <CircularWithValueLabel />
                        </div>
                    ) : (!props.restoredPhoto && props.loadCircularProgress === true &&
                        <div
                            style={!matches ? {
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: 'column',
                                alignItems: "center",
                                gap: '20px',
                                height: `${originalImageHeight}px` ? `${originalImageHeight}px` : `${originalImageHeight}px`,
                            } : { display: "flex", justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', textAlign: matches ? 'center' : 'center' }}
                        >
                            <p style={{ fontSize: matches ? '80px' : '40px' }}>😭</p>
                            <h1>Server is busy. {matches && <br />}
                                <span style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => {
                                        props.setFileUrl(''),
                                            props.setRestoredPhoto(''),
                                            props.setLoadCircularProgress(false)
                                        props.setLoading(false)
                                        props.setError(null)
                                        router.push('#ClickToUp')

                                    }}>Please Retry
                                </span>
                            </h1>
                        </div>
                    )
                )}
                {
                    props.fileUrl && props.imageColorization &&
                    <ImageStrip setRestoredPhoto={props.setRestoredPhoto} setRestoreImageUrl={props.setRestoreImageUrl} restoreImageURLForVarient={props.restoreImageURLForVarient} imageColorizationOne={props.imageColorizationOne} imageColorization={props.imageColorization} imageColorizationTwo={props.imageColorizationTwo} imageColorizationThree={props.imageColorizationThree} imageColorizationFour={props.imageColorizationFour} />
                }

                {props.restoredPhoto && (
                    <div
                        className="upload-download-button"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "30px",
                            marginTop: "20px"
                        }}
                    >
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                props.setRestoredPhoto("");
                                context.setFileUrl("");
                                props.setLoadCircularProgress(false)
                                props.setError(null)
                                if (toggleClick === true) {
                                    setToggleClick(false);
                                }
                                router.push('#ClickToUp');
                                setOriginalImageWidth(0);
                                setOriginalImageHieght(0);
                                window.location.reload()

                            }}
                        >
                            Upload New
                        </button>
                        <button
                            style={{ cursor: "pointer" }}
                            onClick={handleDownloadFile}
                        >
                            Download{" "}
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default ImageComponent