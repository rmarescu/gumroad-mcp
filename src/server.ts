/* eslint-disable sort-keys */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";

import { GumroadClient } from "./gumroad-client.js";

config();

const getProducts: Tool = {
  name: "gumroad_get_products",
  description: "Retrieves all of the products",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const getSales: Tool = {
  name: "gumroad_get_sales",
  description: "Retrieves all of the successful sales",
  inputSchema: {
    type: "object",
    properties: {
      after: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "Only return sales after this date (YYYY-MM-DD)",
      },
      before: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        description: "Only return sales before this date (YYYY-MM-DD)",
      },
      product_id: { type: "string", description: "Filter sales by this product" },
      email: { type: "string", description: "Filter sales by this email" },
      order_id: { type: "string", description: "Filter sales by this Order ID" },
      page_key: { type: "string", description: "A key representing a page of results" },
    },
  },
};

const getProduct: Tool = {
  name: "gumroad_get_product",
  description: "Retrieves a single product by its ID",
  inputSchema: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "The ID of the product to retrieve" },
    },
    required: ["product_id"],
  },
};

const getUser: Tool = {
  name: "gumroad_get_user",
  description: "Retrieves the authenticated user's data. Available with any scope.",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const disableProduct: Tool = {
  name: "gumroad_disable_product",
  description: "Disables a product by its ID",
  inputSchema: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "The ID of the product to disable" },
    },
    required: ["product_id"],
  },
};

const enableProduct: Tool = {
  name: "gumroad_enable_product",
  description: "Enables a product by its ID",
  inputSchema: {
    type: "object",
    properties: {
      product_id: { type: "string", description: "The ID of the product to enable" },
    },
    required: ["product_id"],
  },
};

export const createServer = (accessToken: string, baseUrl: string | undefined) => {
  const gumroadClient = new GumroadClient(accessToken, baseUrl);

  const server = new Server(
    {
      name: "Gumroad MCP Server",
      version: "0.0.1",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    console.error("Received CallToolRequest:", request);
    try {
      if (!request.params.arguments) {
        throw new Error("No arguments provided");
      }

      switch (request.params.name) {
        case "gumroad_get_user": {
          const response = await gumroadClient.getUser();
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        case "gumroad_get_products": {
          const response = await gumroadClient.getProducts();
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        case "gumroad_get_product": {
          const productId = request.params.arguments.product_id as string;
          const response = await gumroadClient.getProduct(productId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        case "gumroad_disable_product": {
          const productId = request.params.arguments.product_id as string;
          const response = await gumroadClient.disableProduct(productId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        case "gumroad_enable_product": {
          const productId = request.params.arguments.product_id as string;
          const response = await gumroadClient.enableProduct(productId);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        case "gumroad_get_sales": {
          const response = await gumroadClient.getSales(request.params.arguments);
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      console.error("Error executing tool:", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  });

  server.setRequestHandler(ListToolsRequestSchema, () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [getUser, getProduct, getProducts, getSales, disableProduct, enableProduct],
    };
  });

  return { server, cleanup: () => server.close() };
};
