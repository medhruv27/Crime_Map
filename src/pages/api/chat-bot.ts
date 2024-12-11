import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import type { NextApiRequest, NextApiResponse } from "next";
import crimeData from "./crime_rate.json";

dotenv.config();

const llm = new ChatOpenAI();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  try {
    const { city, business } = req.body;

    // Step 1: Fetch latitude and longitude for the city using geocoding API
    const geocodeResponse = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(city)}&api_key=6731ba315cffe534055054tsw3978a9`
    );

    if (!geocodeResponse.ok) {
      throw new Error(`Geocode API error: ${geocodeResponse.statusText}`);
    }

    const geocodeData = await geocodeResponse.json();
    const { lat, lon } = geocodeData[0];

    // Step 2: Use lat/lon to fetch the police force from the UK Police API
    const policeApiResponse = await fetch(
      `https://data.police.uk/api/locate-neighbourhood?q=${lat},${lon}`
    );

    if (!policeApiResponse.ok) {
      throw new Error(`Police API error: ${policeApiResponse.statusText}`);
    }

    const policeData = await policeApiResponse.json();
    const force = policeData.force;

    // Step 3: Fetch the crime rate from local data using force + '-street'
    const crimeRateKey = `${force}-street` as keyof typeof crimeData;
    const crimeRate = crimeData[crimeRateKey] || "unknown";

    // Ensure crimeRate is a number; otherwise, set a default rate for display
    const crimeRateDisplay = typeof crimeRate === "number" ? crimeRate : "an unknown rate";

    // Step 4: Create a dynamic system prompt based on the crime rate
    const getSystemPrompt = (crimeRate: number) => {
      if (crimeRate > 110) {
        return "The crime rate in this area is significantly high. Emphasize stringent security measures and an urgent tone, and go into detail.";
      } else if (crimeRate > 80) {
        return "The crime rate in this area is moderate. Suggest strong security measures with a serious tone.";
      } else {
        return "The crime rate in this area is relatively low. Suggest basic security precautions in a reassuring tone.";
      }
    };

    const systemPrompt = getSystemPrompt(Number(crimeRate));

    // Step 5: Combine the system prompt and main prompt
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemPrompt),
      HumanMessagePromptTemplate.fromTemplate(
        `The annual crime rate in {city} is {crimeRate} incidents per 1,000 people. Make sure to incorporate this information prominently in the first line of your response! Given this rate, here are some tailored security measures for a {business} in {city}:`
      ),
    ]);

    // Generate the LLM response using the updated chain
    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
      city,
      business,
      crimeRate: crimeRateDisplay,
    });

    // Parse and return the response
    res.status(200).json({
      content: response.lc_kwargs.content, coordinates: [Number(lat), Number(lon)]
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(`Error: ${error.message}`);
  }
}
