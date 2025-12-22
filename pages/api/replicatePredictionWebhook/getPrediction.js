// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../api/auth/[...nextauth]"
// import { getUserPlan } from "@/lib/userData";
import bodyParser from 'body-parser';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb', // Set this to the desired limit, e.g., 10mb
        },
    },
};

export default async function handler(req, res) {
    const fileUrl = req.body.imageUrl;
    const apiName = req.body.apiName;
    const maskedImageUrl = req.body.maskedImageUrl


    if (apiName === 'restorePhoto') {
        // Restore Photo

        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
                    input: { img: fileUrl, version: "v1.4", scale: 2 },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),

            });
            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }
    if (apiName === 'backgroundRemoval') {
        // Remove Background
        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
                    input: { image: fileUrl },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),
            });

            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }

    if (apiName === 'aiHomeMakeOver') {
        const prompt = req.body.prompt;
        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b",
                    input: {
                        image: fileUrl,
                        prompt: prompt,
                        num_samples: '1',
                        image_resolution: '512',
                        ddim_steps: 20,
                        scale: 9,
                        a_prompt: "best quality, extremely detailed",
                        n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, nudity,Voilence,Sexual Content,Adult Content,private Content,Harassment,Bullying,Suicide,weapons",
                        detect_resolution: 512,
                        value_threshold: 0.1,
                        distance_threshold: 0.1
                    },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),
            });

            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }

    // Trendy Look
    if (apiName === 'trendyLook') {
        const prompt = req.body.prompt;
        const clothingPosition = req.body.clothingPosition;
        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "4e7916cc6ca0fe2e0e414c32033a378ff5d8879f209b1df30e824d6779403826",
                    input: {
                        image: fileUrl,
                        clothing: clothingPosition,
                        prompt: "a person wearing " + prompt + ", best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning"
                    },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),
            });

            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }

    if (apiName === 'imageColorization') {
        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "9451bfbf652b21a9bccc741e5c7046540faa5586cfa3aa45abc7dbb46151a4f7",
                    input: { image: fileUrl, classess: 88, mode: "Real Gray Colorization" },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),
            });
            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }

    if (apiName === 'object-remove') {
        // object-remove

        try {
            // POST request to Replicate to start the image restoration generation process
            const callbackURL = `${process.env.REPLICATE_WEBHOOK_URL}/api/replicatePredictionWebhook/restorePhotoWebhook`;
            let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Token " + process.env.REPLICATE_API_KEY,
                },
                body: JSON.stringify({
                    version:
                        "cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72",
                    input: {
                        mask: maskedImageUrl,
                        image: fileUrl,
                    },
                    webhook: callbackURL,
                    webhook_events_filter: ["completed"],
                }),

            });
            let jsonStartResponse = await startResponse.json();

            res.status(200).json(jsonStartResponse);
        } catch (err) {
            res.status(500).json("Server is busy please try again later");
        }
    }

}