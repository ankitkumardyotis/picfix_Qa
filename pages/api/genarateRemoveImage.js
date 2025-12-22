import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import prisma from "@/lib/prisma";

export default async function handler(req, res) {
  const fileUrl = req.body.imageUrl;
  const session = await getServerSession(req, res, authOptions)



  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }

  // let planData = await prisma.plan.findMany({
  //   where: {
  //     userId: session.user.id,
  //   }
  // }).catch(err => {
  //   console.error('Error creating Plan:', err);
  // });

  // if (planData.length === 0) {
  //   res.status(401).json("Please Subscribe to a plan to use this feature.");
  //   return;
  // }

  // if (planData[0].remainingPoints < 1) {
  //   res.status(401).json("You don't have enough credit points to use this feature.");
  //   return;
  // }


  try {

    // POST request to Replicate to start the image restoration generation process
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
      }),
    });

    let jsonStartResponse = await startResponse.json();
  
    let endpointUrl = jsonStartResponse.urls.get;
   

    // // GET request to get the status of the image restoration process & return the result when it's ready
    let removeBackground = null;
    while (!removeBackground) {
      // Loop in 1s intervals until the alt text is ready

      let finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + process.env.REPLICATE_API_KEY,
        },
      });
      let jsonFinalResponse = await finalResponse.json();

      if (jsonFinalResponse.status === "succeeded") {
        removeBackground = jsonFinalResponse.output;


        const createPlan = await prisma.history.create({
          data: {
            userId: session.user.id,
            model: jsonFinalResponse.model,
            status: jsonFinalResponse.status,
            createdAt: jsonFinalResponse.created_at,
            replicateId: jsonFinalResponse.id
          }
        }).catch(err => {
          console.error('Error creating Plan:', err);
        });
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } res.status(200).json(removeBackground ? removeBackground : "Failed to restore image");
  } catch (err) {
    res.status(500).json("Server is busy please try again later");
  }
}