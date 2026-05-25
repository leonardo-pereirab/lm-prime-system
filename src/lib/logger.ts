import pino from "pino";

const usarPrettyLogger =
  process.env.NODE_ENV === "development" && process.env.LOG_PRETTY === "true";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "senha",
      "*.senha",
      "token",
      "*.token",
      "cpfCnpj",
      "*.cpfCnpj",
      "cnh",
      "*.cnh",
    ],
    remove: true,
  },
  transport: usarPrettyLogger
    ? {
        target: "pino-pretty",
        options: { colorize: true },
      }
    : undefined,
});
