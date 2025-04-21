import pc from "picocolors";
import { ZodError } from "zod";

export const formatZodError = <T>(error: ZodError<T>, label: string): string => {
  console.log(error.errors);
  const errorsString = error.errors
    .map((err) => {
      const path = err.path.join(".");
      const prefix = path ? `${pc.cyan(path)}: ` : "";
      const receivedInfo =
        "received" in err && err.received !== "undefined" ? ` (received: ${JSON.stringify(err.received)})` : "";
      return `${prefix}${err.message}${receivedInfo}`;
    })
    .join("\n");

  return `${label}\n${errorsString}`;
};
