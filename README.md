# Gumroad MCP Server

## Overview

A Model Context Protocol (MCP) server implementation for Gumroad, enabling MCP-compatible AI clients like Claude Desktop to interract with [Gumroad's API](https://gumroad.com/api).

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) allows AI assistants to interact with external tools and services.

## Usage

Once configured, try these commands in your MCP-compatible client:

- How many sales did I make last month?
- Show my recent Gumroad sales
- List my top-selling products on Gumroad from last year
- Show month-over-month trend of my top-selling product last year
- Show sales for my product "Product Name"

## Tools

1. [`gumroad_get_products`](https://gumroad.com/api#products)
2. [`gumroad_get_sales`](https://gumroad.com/api#sales)
3. [`gumroad_get_user`](https://gumroad.com/api#user)

## Setup

### Generate an access token

Gumroad API requires [authentication](https://gumroad.com/api#api-authentication). To generate an access token for the Gumroad API, follow these steps:

1. [Log in](https://gumroad.com/login) to your Gumroad account.
2. Go to Settings > [Advanced](https://gumroad.com/settings/advanced) page.
3. Create a new application by providing the following information:
   - Application icon (optional): A small thumbnail image to identify your application.
   - Application name: A name for your application.
   - Redirect URI: For personal use, you can enter `http://127.0.0.1` (localhost) as this value is not meaningful in this context.
4. Click "Create application."
5. Use the "Generate access token" button to get your access token.

Keep your access token safe and confidential, like a password. You'll need to include it in your configuration as shown below.

### Install the server

Works with [Claude Desktop](https://claude.ai/download) or any [other MCP-enabled applications](https://modelcontextprotocol.io/clients).

Example config

```json
{
  "mcpServers": {
    "gumroad": {
      "command": "npx",
      "args": ["gumroad-mcp@latest"],
      "env": {
        "GUMROAD_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

### Using on your own Gumroad installation

If you're using a self-hosted Gumroad instance, you can configure the server to connect to your custom URL via `GUMROAD_BASE_URL`:

```json
{
  "mcpServers": {
    "gumroad": {
      "command": "npx",
      "args": ["gumroad-mcp@latest"],
      "env": {
        "GUMROAD_ACCESS_TOKEN": "<YOUR_TOKEN>",
        "GUMROAD_BASE_URL": "https://example.com"
      }
    }
  }
}
```

> [!NOTE]
> The server automatically appends `/api/v2` to your base URL. For example, with `GUMROAD_BASE_URL="https://example.com"`, API requests will be sent to `https://example.com/api/v2`.

## Contributing

Found a bug or want to suggest a feature? Please open an issue or submit a pull request on GitHub.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
