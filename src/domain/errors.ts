export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class ValidationError extends DomainError {}
export class InvalidTransitionError extends DomainError {}
export class ConflictError extends DomainError {}
export class TooManyRequestsError extends DomainError {}
