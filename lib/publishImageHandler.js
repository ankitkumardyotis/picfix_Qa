import { uploadCommunityImage, imageUrlToBuffer, generateSafeFileName } from './communityImageStorage';
import prisma from './prisma';

export async function handleImagePublish(publishData) {
    const { 
        outputImage, 
        inputImages = [], 
        model, 
        userId, 
        userName, 
        userEmail,
        title,
        prompt,
        modelParams,
        aspectRatio
    } = publishData;

    try {
        // 1. Upload output image and get path
        const outputBuffer = await imageUrlToBuffer(outputImage);
        const outputFileName = generateSafeFileName(title || prompt, 'output') + '.jpg';
        
        const outputResult = await uploadCommunityImage(
            outputBuffer, 
            outputFileName, 
            'image/jpeg',
            model,
            'output'
        );

        // 2. Upload input images and get paths
        const processedInputImages = [];
        
        for (let i = 0; i < inputImages.length; i++) {
            const inputImage = inputImages[i];
            if (inputImage.url) {
                try {
                    const inputBuffer = await imageUrlToBuffer(inputImage.url);
                    const inputFileName = `input${i + 1}.jpg`;
                    
                    const inputResult = await uploadCommunityImage(
                        inputBuffer,
                        inputFileName,
                        'image/jpeg',
                        model,
                        `input${i + 1}`
                    );
                    
                    processedInputImages.push({
                        path: inputResult.path,  // Store path, not URL
                        type: inputImage.type || `input${i + 1}`,
                        order: i
                    });
                } catch (error) {
                    console.error(`Error uploading input image ${i + 1}:`, error);
                    // Continue with other images even if one fails
                }
            }
        }

        // 3. Store in database (paths only)
        const publishedImage = await prisma.publishedImage.create({
            data: {
                userId,
                userName,
                userEmail,
                outputImagePath: outputResult.path,  // Store path, not URL
                inputImagePaths: processedInputImages,
                title: title || null,
                prompt: prompt || null,
                model,
                modelParams: modelParams || {},
                aspectRatio: aspectRatio || null,
                isApproved: true // Auto-approve for now, can add moderation later
            }
        });

        return publishedImage;

    } catch (error) {
        console.error('Error publishing image:', error);
        throw error;
    }
}

// Get model-specific input image data from current state
export function getModelInputImages(selectedModel, currentState) {
    const inputImages = [];
    
    switch (selectedModel) {
        case 'hair-style':
            if (currentState.uploadedImage) {
                inputImages.push({
                    url: currentState.uploadedImage,
                    type: 'original'
                });
            }
            break;
            
        case 'combine-image':
            if (currentState.combineImage1) {
                inputImages.push({
                    url: currentState.combineImage1,
                    type: 'image1'
                });
            }
            if (currentState.combineImage2) {
                inputImages.push({
                    url: currentState.combineImage2,
                    type: 'image2'
                });
            }
            break;
            
        case 'text-removal':
            if (currentState.textRemovalImage) {
                inputImages.push({
                    url: currentState.textRemovalImage,
                    type: 'original'
                });
            }
            break;
            
  
            
        case 'headshot':
            if (currentState.headshotImage) {
                inputImages.push({
                    url: currentState.headshotImage,
                    type: 'original'
                });
            }
            break;
            
        case 'restore-image':
            if (currentState.restoreImage) {
                inputImages.push({
                    url: currentState.restoreImage,
                    type: 'original'
                });
            }
            break;
            
        case 'gfp-restore':
            if (currentState.gfpRestoreImage) {
                inputImages.push({
                    url: currentState.gfpRestoreImage,
                    type: 'original'
                });
            }
            break;
            
        case 'home-designer':
            if (currentState.homeDesignerImage) {
                inputImages.push({
                    url: currentState.homeDesignerImage,
                    type: 'original'
                });
            }
            break;
            
        case 'background-removal':
            if (currentState.backgroundRemovalImage) {
                inputImages.push({
                    url: currentState.backgroundRemovalImage,
                    type: 'original'
                });
            }
            break;
            
        case 'remove-object':
            if (currentState.removeObjectImage) {
                inputImages.push({
                    url: currentState.removeObjectImage,
                    type: 'original'
                });
            }
            if (currentState.removeObjectMask) {
                inputImages.push({
                    url: currentState.removeObjectMask,
                    type: 'mask'
                });
            }
            break;
            
        case 're-imagine':
            if (currentState.reimagineImage) {
                inputImages.push({
                    url: currentState.reimagineImage,
                    type: 'original'
                });
            }
            break;
            
        case 'generate-image':
            // No input images needed
            break;
            
        default:
            console.warn('Unknown model type:', selectedModel);
    }

    return inputImages;
}

// Get model-specific parameters
export function getModelParameters(selectedModel, currentState) {
    const baseParams = {
        aspectRatio: currentState.aspectRatio
    };

    switch (selectedModel) {
        case 'hair-style':
            return {
                ...baseParams,
                hairStyle: currentState.selectedHairStyle,
                hairColor: currentState.selectedHairColor,
                gender: currentState.selectedGender
            };
            
        case 'headshot':
            return {
                ...baseParams,
                gender: currentState.selectedHeadshotGender,
                background: currentState.selectedHeadshotBackground
            };
            
        case 're-imagine':
            return {
                ...baseParams,
                gender: currentState.selectedReimagineGender,
                scenario: currentState.selectedScenario
            };
            
        case 'remove-object':
            return {
                ...baseParams,
                type: 'Object Removal with Mask Editing'
            };
            
        default:
            return baseParams;
    }
} 