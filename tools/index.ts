import { tool } from "@openai/agents";
import { z } from "zod";
import { promises as fs } from "fs";

export const writeFileTool = tool({
  description: "Write text content to a file on the local filesystem",
  strict: true,
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async ({ path, content }: { path: string; content: string }) => {
    try {
      await fs.writeFile(path, content, "utf-8");
      console.log(`File written successfully to ${path}`);
      return `File written successfully to ${path}`;
    } catch (err: any) {
      return `Error writing file: ${err.message}`;
    }
  },
});

export const imageCreateTool = tool({
  description: "Call WaveSpeed API to edit/generate images",
  strict: true,
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
      return { error: `${response.status} ${response.statusText}` };
    }
    return await response.json();
  },
});
