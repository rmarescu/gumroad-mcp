#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server.js";

const main = async () => {
  const accessToken = process.env.GUMROAD_ACCESS_TOKEN;
  const baseUrl = process.env.GUMROAD_BASE_URL;

  if (!accessToken) {
    console.error("Please set GUMROAD_ACCESS_TOKEN environment variable.");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  const { server, cleanup } = createServer(accessToken, baseUrl);
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
};

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
