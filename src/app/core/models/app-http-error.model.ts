export type AppHttpErrorKind =
  | 'network'
  | 'bad-request'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'conflict'
  | 'validation'
  | 'locked'
  | 'server'
  | 'unknown';

export class AppHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly kind: AppHttpErrorKind,
    message: string,
    public readonly details: unknown = null,
  ) {
    super(message);
    this.name = 'AppHttpError';
  }
}
