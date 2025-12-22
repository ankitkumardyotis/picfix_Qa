import { replicate } from "@/lib/replicate";
import { REPLICATE_MODELS } from "@/lib/replicate/models";
import { runModel } from "@/lib/replicate/runModel";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, input } = req.body;

    if (!model || !input) {
      return res.status(400).json({ error: 'Model and input are required' });
    }

    const result = await runModel(model, input);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error running model:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}