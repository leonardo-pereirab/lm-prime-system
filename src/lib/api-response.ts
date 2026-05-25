import { NextResponse } from "next/server";
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

type ApiErrorBody = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  correlationId?: string;
};

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

function jsonError(error: DomainError, status: number) {
  const payload: ApiErrorBody = {
    code: error.code,
    message: error.message,
    ...(error.fields && { fields: error.fields }),
  };

  return NextResponse.json({ success: false, error: payload }, { status });
}

export async function ok<T>(handler: () => Promise<T>) {
  try {
    const data = await handler();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return fail(error);
  }
}

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION",
          message: "Dados invalidos.",
          fields: zodToFields(error),
        },
      },
      { status: 422 },
    );
  }

  if (error instanceof NotFoundError) return jsonError(error, 404);
  if (error instanceof UnauthorizedError) return jsonError(error, 401);
  if (error instanceof ForbiddenError) return jsonError(error, 403);
  if (error instanceof ValidationError) return jsonError(error, 422);
  if (error instanceof InvalidTransitionError) return jsonError(error, 409);
  if (error instanceof ConflictError) return jsonError(error, 409);
  if (error instanceof TooManyRequestsError) return jsonError(error, 429);
  if (error instanceof DomainError) return jsonError(error, 400);

  const correlationId = crypto.randomUUID();
  logger.error({ err: error, correlationId }, "Unhandled error");

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL",
        message: "Erro interno. Tente novamente.",
        correlationId,
      },
    },
    { status: 500 },
  );
}
