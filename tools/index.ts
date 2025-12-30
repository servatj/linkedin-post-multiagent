import { tool } from "@openai/agents";
import { z } from "zod";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { logToolCall, logToolResult } from "../utils/logger";

export const writeFileTool = tool({
  name: "write_file",
  description: "Write text content to a file on the local filesystem",
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }: { path: string; content: string }) => {
    logToolCall("write_file", { path, contentLength: content.length });
    try {
      await fs.writeFile(path, content, "utf-8");
      const result = `File written successfully to ${path}`;
      logToolResult("write_file", result);
      return result;
    } catch (err: any) {
      const result = `Error writing file: ${err.message}`;
      logToolResult("write_file", result);
      return result;
    }
  },
});

export const createPostWithImageTool = tool({
  name: "create_post_file",
  description: "Create a complete post file that includes the post content and image information",
  parameters: z.object({
    postContent: z.string().describe("The main post content/text"),
    imageUrl: z.string().describe("The URL of the generated image (use empty string if none)"),
    imageFilePath: z.string().describe("The local file path where the image is saved (use empty string if none)"),
    outputPath: z.string().describe("Where to save the complete post file (e.g., './posts/my-post.md')"),
  }),
  execute: async ({
    postContent,
    imageUrl,
    imageFilePath,
    outputPath,
  }: {
    postContent: string;
    imageUrl: string;
    imageFilePath: string;
    outputPath: string;
  }) => {
    logToolCall("create_post_file", { outputPath, hasImage: !!(imageUrl || imageFilePath) });

    try {
      // Create directory if needed
      const dir = outputPath.split('/').slice(0, -1).join('/');
      if (dir) {
        await fs.mkdir(dir, { recursive: true });
      }

      let fullContent = `# Post\n\n${postContent}\n\n`;

      if ((imageUrl && imageUrl.trim()) || (imageFilePath && imageFilePath.trim())) {
        fullContent += `---\n\n## Image Details\n\n`;
        if (imageFilePath && imageFilePath.trim()) {
          fullContent += `**Local File:** ${imageFilePath}\n\n`;
          fullContent += `![Generated Image](${imageFilePath})\n\n`;
        }
        if (imageUrl && imageUrl.trim()) {
          fullContent += `**Original URL:** ${imageUrl}\n\n`;
        }
      }

      await fs.writeFile(outputPath, fullContent, "utf-8");

      const result = {
        success: true,
        filePath: outputPath,
        message: `Post saved to ${outputPath}`,
      };
      logToolResult("create_post_file", `SUCCESS: ${outputPath}`);
      return result;
    } catch (err: any) {
      const result = {
        success: false,
        error: err.message,
      };
      logToolResult("create_post_file", `ERROR: ${err.message}`);
      return result;
    }
  },
});


export const imageCreateNanoBananProTool = tool({
  name: "generate_image",
  description: "Create an image using WaveSpeed API",
  parameters: z.object({
    prompt: z.string().describe("A detailed description of the image to generate"),
    size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).describe("Image size (use '1024x1024' as default)"),
  }),
  execute: async ({
    prompt,
    size,
  }: {
    prompt: string;
    size: "1024x1024" | "1792x1024" | "1024x1792";
  }) => {
    // Use default if not provided or empty
    const imageSize = size && size.trim() ? size : "1024x1024";
    console.log("generate_image (nano banana pro )");

    if (!process.env.WAVESPEED_API_KEY) {
      console.error("Your API_KEY is not set, you can check it in Access Keys");
      return;
    }
    const url = "https://api.wavespeed.ai/api/v3/google/nano-banana-pro/text-to-image";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`
    };
    const payload = {
      "aspect_ratio": "3:4",
      "enable_base64_output": false,
      "enable_sync_mode": false,
      "output_format": "png",
      "prompt": prompt,
      "resolution": "2k"
    };

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });


      if (response.ok) {

        const result = await response.json();
        const requestId = result.data.id;
        console.log(`Task submitted successfully. Request ID: ${requestId}`);

        while (true) {
          const response = await fetch(
            `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`,
            {
              headers: {
                "Authorization": `Bearer ${process.env.WAVESPEED_API_KEY}`
              }
            });
          const result = await response.json();

          if (response.ok) {
            const data = result.data;
            const status = data.status;

            if (status === "completed") {
              const resultUrl = data.outputs[0];
              console.log("Task completed. URL:", resultUrl);

              logToolResult("generate_image", `SUCCESS: ${resultUrl.substring(0, 60)}...`);
              logToolResult("generate_image 2", `full image url: ${resultUrl}`);

             return {
                success: true,
                imageUrl: resultUrl,
                message: `Image generated successfully. URL: ${resultUrl}`,
              };
              break;
            } else if (status === "failed") {
              console.error("Task failed:", data.error);
              break;
            } else {
              console.log("Task still processing. Status:", status);
            }
          } else {
            console.error("Error:", response.status, JSON.stringify(result));
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 0.1 * 1000));
        }
      } else {
        console.error(`Error: ${response.status}, ${await response.text()}`);
      }
    } catch (err: any) {
      logToolResult("generate_image", `ERROR: ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  },
});

// Image GENERATION tool (creates images from prompts)
// export const imageCreateTool = tool({
//   name: "generate_image",
//   description: "Generate an image from a text prompt using DALL-E",
//   parameters: z.object({
//     prompt: z.string().describe("A detailed description of the image to generate"),
//     size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).describe("Image size (use '1024x1024' as default)"),
//   }),
//   execute: async ({
//     prompt,
//     size,
//   }: {
//     prompt: string;
//     size: "1024x1024" | "1792x1024" | "1024x1792";
//   }) => {
//     // Use default if not provided or empty
//     const imageSize = size && size.trim() ? size : "1024x1024";
//     logToolCall("generate_image (DALL-E 3)", { prompt: prompt.substring(0, 80) + "...", size: imageSize });

//     const openai = new OpenAI();

//     try {
//       const response = await openai.images.generate({
//         model: "dall-e-3",
//         prompt,
//         n: 1,
//         size: imageSize,
//       });

//       const imageData = response.data?.[0];
//       const imageUrl = imageData?.url ?? null;
//       const revisedPrompt = imageData?.revised_prompt ?? null;

//       if (!imageUrl) {
//         logToolResult("generate_image", "ERROR: No image URL returned");
//         return {
//           success: false,
//           error: "No image URL returned from API",
//         };
//       }

//       logToolResult("generate_image", `SUCCESS: ${imageUrl.substring(0, 60)}...`);
//       logToolResult("generate_image 2", `full image url: ${imageUrl}`);

//       return {
//         success: true,
//         imageUrl,
//         revisedPrompt,
//         message: `Image generated successfully. URL: ${imageUrl}`,
//       };
//     } catch (err: any) {
//       logToolResult("generate_image", `ERROR: ${err.message}`);
//       return {
//         success: false,
//         error: err.message,
//       };
//     }
//   },
// });

// Image DOWNLOAD tool (downloads and saves images locally)
export const imageDownloadTool = tool({
  name: "download_image",
  description: "Download an image from a URL and save it to the local filesystem",
  parameters: z.object({
    imageUrl: z.string().describe("The URL of the image to download"),
    filename: z.string().describe("The filename to save the image as (e.g., 'post-image.png')"),
    directory: z.string().describe("Directory to save to (use './images' as default)"),
  }),
  execute: async ({
    imageUrl,
    filename,
    directory,
  }: {
    imageUrl: string;
    filename: string;
    directory: string;
  }) => {
    // Use default if empty
    const targetDir = directory && directory.trim() ? directory : "./images";
    logToolCall("download_image", { imageUrl: imageUrl.substring(0, 60) + "...", filename, directory: targetDir });

    try {
      // Create directory if it doesn't exist
      await fs.mkdir(targetDir, { recursive: true });

      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const filePath = `${targetDir}/${filename}`;

      // Save to file
      await fs.writeFile(filePath, Buffer.from(buffer));

      const result = {
        success: true,
        filePath,
        message: `Image downloaded and saved to ${filePath}`,
      };

      logToolResult("download_image", `SUCCESS: Saved to ${filePath}`);
      return result;
    } catch (err: any) {
      const result = {
        success: false,
        error: err.message,
      };
      logToolResult("download_image", `ERROR: ${err.message}`);
      return result;
    }
  },
});

// Image EDIT tool (modifies existing images)
export const imageEditTool = tool({
  name: "edit_image",
  description: "Edit an existing image using WaveSpeed API",
  parameters: z.object({
    prompt: z.string(),
    imageUrl: z.string(),
    resolution: z.enum(["1k", "2k", "4k"]).optional(),
  }),
  execute: async ({
    prompt,
    imageUrl,
    resolution,
  }: {
    prompt: string;
    imageUrl: string;
    resolution?: "1k" | "2k" | "4k";
  }) => {
    logToolCall("edit_image", { prompt, imageUrl: imageUrl.substring(0, 50) });

    const response = await fetch(
      "https://api.wavespeed.ai/api/v3/google/nano-banana-pro/edit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WAVESPEED_API_KEY}`,
        },
        body: JSON.stringify({
          enable_base64_output: false,
          enable_sync_mode: false,
          images: [imageUrl],
          output_format: "png",
          prompt: prompt,
          resolution: resolution ?? "1k",
        }),
      }
    );
    if (!response.ok) {
      const result = { error: `${response.status} ${response.statusText}` };
      logToolResult("edit_image", JSON.stringify(result));
      return result;
    }
    const result = await response.json();
    logToolResult("edit_image", "SUCCESS");
    return result;
  },
});
