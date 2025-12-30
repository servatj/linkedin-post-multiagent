import "dotenv/config";
import { get } from "node:http";



async function main() {
    const response = await fetch(
            "https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
              },
              body: JSON.stringify({
                aspect_ratio: "16:9",
                enable_base64_output: false,
                enable_sync_mode: false,
                output_format: "png",
                prompt: "create a white board about context in agens sdk open ai ",
                resolution: "1k",
              }),
            }
          );

          if(response.ok) {
            const result = await response.json();
            const requestId = result.data.id;
            console.log(requestId) 
          }
}

main() ;


const getImage = async (requestId: string) => {

  const response = await fetch(requestId, { method: "GET", headers:{ "Content-Type": "application/json", "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`}});
  const result = await response.json();
  console.log(result)

}

const getResult = async () => {
   await getImage("kk");
}

// getResult();