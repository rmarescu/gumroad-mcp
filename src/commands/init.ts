import { exec } from "child_process";
import fs from "fs";
import { homedir } from "os";
import { join } from "path";

import { confirm, input, password } from "@inquirer/prompts";
import { ListrInquirerPromptAdapter } from "@listr2/prompt-adapter-inquirer";
import { Command } from "commander";
import { Listr } from "listr2";
import pc from "picocolors";

import { GumroadClient } from "../gumroad-client.js";

export const initCommand = new Command("init").description("Initialize Gumroad MCP in Claude Desktop").addHelpText(
  "after",
  `
${pc.bold("What this will do:")}
- Check if Claude Desktop is installed
- Set up your Gumroad API connection
- Configure everything in Claude Desktop
- Restart Claude to apply changes

${pc.bold("You'll need:")}
- Claude Desktop installed on your computer
- Your Gumroad API access token handy

${pc.bold("Need help?")}
${pc.cyan("https://github.com/rmarescu/gumroad-mcp")}
`,
);

const SERVER_NAME = "gumroad";

interface Ctx {
  accessToken: string;
  baseUrl: string;
  claudeDesktopInstalled: boolean;
  useGumroadDotCom: boolean;
}

initCommand.action(async () => {
  try {
    const tasks = new Listr<Ctx>(
      [
        {
          title: "Looking for Claude Desktop",
          task: (ctx, task) => {
            ctx.claudeDesktopInstalled = isClaudeDesktopInstalled();

            if (!ctx.claudeDesktopInstalled) {
              task.title = "Claude Desktop isn't installed";
              throw new Error(
                "I couldn't find Claude Desktop on your system. You'll need to install it first, or follow the manual setup instructions if you're using a different MCP-compatible app.",
              );
            }

            task.title = "Found Claude Desktop!";
          },
        },
        {
          title: "Collecting Gumroad details",
          enabled: (ctx) => ctx.claudeDesktopInstalled,
          task: (_, task) =>
            task.newListr(
              [
                {
                  title: "Checking which Gumroad URL to use",
                  task: async (ctx, confirmTask) => {
                    ctx.useGumroadDotCom = await confirmTask.prompt(ListrInquirerPromptAdapter).run(confirm, {
                      default: true,
                      message: "Are you using the regular gumroad.com site?",
                    });

                    if (ctx.useGumroadDotCom) {
                      ctx.baseUrl = GumroadClient.BASE_URL;
                      confirmTask.title = `Using standard Gumroad URL: ${ctx.baseUrl}`;
                    }
                  },
                },
                {
                  title: "Getting your custom Gumroad URL",
                  enabled: (ctx) => !ctx.useGumroadDotCom,
                  task: async (ctx, urlTask) => {
                    ctx.baseUrl = await urlTask.prompt(ListrInquirerPromptAdapter).run(input, {
                      default: "https://example.com",
                      message: "What's your custom Gumroad URL?",
                    });

                    urlTask.title = `Using your custom URL: ${ctx.baseUrl}`;
                  },
                },
                {
                  title: "Getting your API access token",
                  task: async (ctx, tokenTask) => {
                    ctx.accessToken = await tokenTask.prompt(ListrInquirerPromptAdapter).run(password, {
                      mask: true,
                      message: "What's your Gumroad API access token?",
                    });

                    if (!ctx.accessToken) {
                      throw new Error("I need your Gumroad API token to connect to your account.");
                    }

                    tokenTask.title = "API token saved";
                  },
                },
              ],
              { rendererOptions: { collapseSubtasks: false } },
            ),
        },
        {
          title: "Updating Claude Desktop settings",
          enabled: (ctx) => ctx.claudeDesktopInstalled && !!ctx.accessToken,
          task: async (ctx, configTask) => {
            const configFolderPath = getClaudeConfigFolderPath();
            const configFilePath = join(configFolderPath, "claude_desktop_config.json");
            const npxPath = await getNpxPath();

            if (!fs.existsSync(configFolderPath)) {
              throw new Error(
                "I couldn't find Claude Desktop on your system. You'll need to install it first, or follow the manual setup instructions if you're using a different MCP-compatible app.",
              );
            }

            if (!fs.existsSync(configFilePath)) {
              fs.writeFileSync(configFilePath, JSON.stringify({}, null, 2));
            }

            const configData = fs.readFileSync(configFilePath, "utf8");
            const config = JSON.parse(configData);

            if (!config.mcpServers) {
              config.mcpServers = {};
            }

            config.mcpServers[SERVER_NAME] = {
              command: npxPath,
              args: ["-y", "gumroad-mcp@latest"],
              env: {
                GUMROAD_ACCESS_TOKEN: ctx.accessToken,
                GUMROAD_BASE_URL: ctx.baseUrl,
              },
            };

            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
            configTask.title = "Claude settings successfully updated";
          },
        },
        {
          title: "Restarting Claude Desktop",
          enabled: (ctx) => ctx.claudeDesktopInstalled && !!ctx.accessToken,
          task: async (_, task) => {
            await restartClaudeDesktop();
            task.title = "Claude restarted successfully";
          },
        },
      ],
      {
        concurrent: false,
        exitOnError: true,
        rendererOptions: {
          collapseErrors: false,
          collapseSubtasks: false,
        },
      },
    );

    const context: Ctx = {
      accessToken: "",
      baseUrl: GumroadClient.BASE_URL,
      claudeDesktopInstalled: false,
      useGumroadDotCom: true,
    };

    await tasks.run(context);

    console.log(pc.green("\nAll done! 🎉 Your Gumroad MCP is ready to use in Claude Desktop."));
  } catch (error) {
    console.error(pc.red("Something went wrong:"), error);
    process.exit(1);
  }
});

const getClaudeConfigFolderPath = () => {
  const platform = process.platform;

  let claudeConfigPath: string;

  switch (platform) {
    case "win32":
      claudeConfigPath = join(process.env.APPDATA ?? "", "Claude");
      break;
    case "darwin":
      claudeConfigPath = join(homedir(), "Library", "Application Support", "Claude");
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return claudeConfigPath;
};

const restartClaudeDesktop = async () => {
  try {
    const platform = process.platform;
    try {
      switch (platform) {
        case "win32":
          await execAsync(`taskkill /F /IM "Claude.exe"`);
          break;
        case "darwin":
          await execAsync(`killall "Claude"`);
          break;
        case "linux":
          await execAsync(`pkill -f "claude"`);
          break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      if (platform === "win32") {
        // it will never start claude
        // await execAsync(`start "" "Claude.exe"`)
      } else if (platform === "darwin") {
        await execAsync(`open -a "Claude"`);
      } else if (platform === "linux") {
        await execAsync(`claude`);
      }
    } catch {}
  } catch (error) {
    console.error(pc.red("Failed to restart Claude:"), error);
  }
};

const execAsync = (command: string) =>
  new Promise((resolve, reject) => {
    const platform = process.platform;
    // Use PowerShell on Windows for better Unicode support and consistency
    const finalCommand = platform === "win32" ? `cmd.exe /c ${command}` : command;

    exec(finalCommand, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });

const isClaudeDesktopInstalled = () => {
  const configFolderPath = getClaudeConfigFolderPath();
  return fs.existsSync(configFolderPath);
};

const getNpxPath = async (): Promise<string> => {
  try {
    const command = process.platform === "win32" ? "where npx" : "which npx";
    const result = (await execAsync(command)) as { stdout: string; stderr: string };
    return result.stdout.trim();
  } catch {
    return "npx";
  }
};
