# Gumroad MCP Server

<video src="https://gist.github.com/user-attachments/assets/3750b072-053c-40a0-9c89-361f861350db" controls autoplay loop muted>
Your browser does not support the video tag.
</video>

## Overview

A Model Context Protocol (MCP) server implementation for Gumroad, enabling MCP-compatible AI clients like Claude Desktop to interract with [Gumroad's API](https://gumroad.com/api).

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) allows AI assistants to interact with external tools and services.

## Usage

Once configured, try these commands in your MCP-compatible client:

- How many sales did I make last month vs a year ago?
- Generate an interactive chart with last year's sales
- List my top-selling products on Gumroad from last year
- Show month-over-month trend of my top-selling product last year
- Disable "Product Name" product
- Enable "Product Name" product
- List all offer codes for "Product Name"
- Create a new offer code "FAFO" with 99% off for "Product Name"
- Delete offer code "abc123" from "Product Name"

## Tools

### [Products](https://gumroad.com/api#products)

- `gumroad_get_products` - Get all products
- `gumroad_get_product` - Get a single product by ID
- `gumroad_disable_product` - Disable a product
- `gumroad_enable_product` - Enable a product

### [Sales](https://gumroad.com/api#sales)

- `gumroad_get_sales` - Get sales data

### [Offer Codes](https://gumroad.com/api#offer-codes)

- `gumroad_get_offer_codes` - Get all offer codes for a product
- `gumroad_get_offer_code` - Get a single offer code
- `gumroad_create_offer_code` - Create a new offer code
- `gumroad_update_offer_code` - Update an existing offer code
- `gumroad_delete_offer_code` - Delete an offer code

### [User](https://gumroad.com/api#user)

- `gumroad_get_user` - Get authenticated user data

## Installation

### Prerequisites

- [Node.js](https://nodejs.org) 18 or later
- A Gumroad account with API access
- An MCP-compatible client (like Claude Desktop)

To verify you have Node installed, open the command line on your computer.

- On macOS, open the Terminal from your Applications folder
- On Windows, press Windows + R, type “cmd”, and press Enter

Once in the command line, verify you have Node installed by entering in the following command:

```bash
node --version
```

### Generate a Gumroad access token

Gumroad API requires [authentication](https://gumroad.com/api#api-authentication). To generate an access token, follow these steps:

1. [Log in](https://gumroad.com/login) to your Gumroad account (or your own instance of Gumroad).
2. Go to Settings > [Advanced](https://gumroad.com/settings/advanced) page.
3. Create a new application by providing the following information:
   - Application icon (optional): A small thumbnail image to identify your application.
   - Application name: A name for your application.
   - Redirect URI: For personal use, you can enter `http://127.0.0.1` (localhost) as this value is not meaningful in this context.
4. Click "Create application."
5. Use the "Generate access token" button to get your access token.

Keep your access token safe and confidential, like a password. You'll need to include it in your configuration as shown below.

## Claude Desktop installation

If you use Claude Desktop, you can use the interactive setup:

```bash
npx @gumroad-mcp init
```

### Manual installation

For [other MCP-enabled applications](https://modelcontextprotocol.io/clients), you will need to update the MCP configuration manually.

Example config

```json
{
  "mcpServers": {
    "gumroad": {
      "command": "npx",
      "args": ["-y", "gumroad-mcp@latest"],
      "env": {
        "GUMROAD_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

If you're using a self-hosted Gumroad instance, you can configure the server to connect to your custom URL via `GUMROAD_BASE_URL`:

```json
{
  "mcpServers": {
    "gumroad": {
      "command": "npx",
      "args": ["-y", "gumroad-mcp@latest"],
      "env": {
        "GUMROAD_ACCESS_TOKEN": "<YOUR_TOKEN>",
        "GUMROAD_BASE_URL": "https://example.com"
      }
    }
  }
}
```

> [!NOTE]
> The server automatically appends the API version (`/v2`) to your base URL. For example, with `GUMROAD_BASE_URL="https://example.com"`, API requests will be sent to `https://example.com/v2`.

Please refer to these [instructions](https://modelcontextprotocol.io/quickstart/user) on how to add the MCP Server to Claude Desktop.

## Contributing

Found a bug or want to suggest a feature? Please open an issue or submit a pull request on GitHub.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
