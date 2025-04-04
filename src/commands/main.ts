import fs from "fs";
import { join } from "path";

import { Command } from "commander";
import pc from "picocolors";

export const MAIN_NAME = "gumroad-mcp";

let currentVersion = "0.0.0";
try {
  const packageJsonPath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  currentVersion = packageJson.version || currentVersion;
} catch (error) {
  console.error("Failed to read package.json", error);
}

export const mainCommand = new Command(MAIN_NAME)
  .description(`${pc.cyan("Gumroad MCP Server")}`)
  .version(currentVersion)
  .configureHelp({
    styleTitle: (title) => pc.bold(title),
  })
  .configureOutput({
    outputError: (str, write) => write(pc.red(str)),
  })
  .showHelpAfterError("(add --help for additional information)")
  .addHelpText(
    "after",
    `
${pc.bold("Environment setup:")}
  Required environment variables:
    GUMROAD_ACCESS_TOKEN                          Gumroad API access token
    GUMROAD_BASE_URL                              Gumroad base URL

${pc.bold("Documentation:")}
  ${pc.cyan("https://github.com/rmarescu/gumroad-mcp")}
`,
  );
