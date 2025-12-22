export default async function handler(req, res) {
    const fileUrl = req.body.imageUrl;
    const prompt = req.body.prompt;
    // POST request to Replicate to start the image  generation process
    let startResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Token " + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        version:
          "ce02013b285241316db1554f28b583ef5aaaf4ac4f118dc08c460e634b2e3e6b",
        input: {
          image: fileUrl,
          prompt: prompt + ", best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning"
        },
      }),
    });
  
    try {
      let jsonStartResponse = await startResponse.json();
      let endpointUrl = jsonStartResponse.urls.get;
      // // GET request to get the status of the image  process & return the result when it's ready
      let restoredImage = null;
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
        } else if (jsonFinalResponse.status === "failed") {
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } res.status(200).json(restoredImage ? restoredImage : "Failed to restore image");
    }
    catch (error) {
      res.status(400).json({ error: error });
    }
  }