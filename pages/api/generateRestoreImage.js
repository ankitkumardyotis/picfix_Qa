import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { getUserPlan } from "@/lib/userData";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  const fileUrl = req.body.imageUrl;


  if (!session) {
    res.status(401).json("Unauthorized");
    return;
  }
  // const planData = await getUserPlan(session.user.id)

  // if (planData[0]?.remainingPoints === 0 || planData[0]?.remainingPoints < 1 || !planData[0]) {
  //   res.status(402).json("Please Subscribe to a plan to use this feature.");
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
          "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
        input: { img: fileUrl, version: "v1.4", scale: 2 },
      }),
    });
    let jsonStartResponse = await startResponse.json();
    let endpointUrl = jsonStartResponse.urls.get;

    // // GET request to get the status of the image restoration process & return the result when it's ready
    let restoredImage = null;
    let responseFromReplicate;
    while (!restoredImage) {
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
        restoredImage = jsonFinalResponse.output;
        responseFromReplicate = jsonFinalResponse
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } res.status(200).json(responseFromReplicate);
  } catch (err) {
    res.status(500).json("Server is busy please try again later");
  }
}