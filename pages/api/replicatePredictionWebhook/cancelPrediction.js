
export default async function handler(req, res) {

    const { replicateId } = req.query;


    const response = await fetch(`https://api.replicate.com/v1/predictions/${replicateId}/cancel`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + process.env.REPLICATE_API_KEY,
        }
    });
    let result = await response.json();
    if(result.status=='canceled'){
        res.status(500).json("Internal Server Error");
        return;
    }

    res.status(200).json({ result })

}