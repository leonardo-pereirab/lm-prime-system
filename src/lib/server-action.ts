import { ZodError } from "zod";
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  InvalidTransitionError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from "@/domain/errors";
import { logger } from "@/lib/logger";

type ActionError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  correlationId?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

function zodToFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }

  return fields;
}

function actionError(error: DomainError): ActionResult<never> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.fields && { fields: error.fields }),
    },
  };
}

export async function actionResult<T>(
  handler: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await handler() };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: {
          code: "VALIDATION",
          message: "Dados invalidos.",
          fields: zodToFields(error),
        },
      };
    }

    if (error instanceof NotFoundError) return actionError(error);
    if (error instanceof UnauthorizedError) return actionError(error);
    if (error instanceof ForbiddenError) return actionError(error);
    if (error instanceof ValidationError) return actionError(error);
    if (error instanceof InvalidTransitionError) return actionError(error);
    if (error instanceof ConflictError) return actionError(error);
    if (error instanceof TooManyRequestsError) return actionError(error);
    if (error instanceof DomainError) return actionError(error);

    const correlationId = crypto.randomUUID();
    logger.error({ err: error, correlationId }, "Unhandled action error");

    return {
      success: false,
      error: {
        code: "INTERNAL",
        message: "Erro interno. Tente novamente.",
        correlationId,
      },
    };
  }
}
