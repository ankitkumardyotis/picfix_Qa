import prisma from "@/lib/prisma";
import { error } from "console";

export default async function handler(req, res) {


    const output = []


    const successfulPrediction = req.body;

    if (successfulPrediction.status === 'succeeded') {
  
        output.push(successfulPrediction.output)

        await prisma.WebhookEvent.create({
            data: {
                replicateId: successfulPrediction.id,
                created_at: successfulPrediction.created_at,
                model: successfulPrediction.model,
                output: output,
                status: successfulPrediction.status
            },
        })



    }
    res.status(200).json("Webhook Recieved Successfully");

}

