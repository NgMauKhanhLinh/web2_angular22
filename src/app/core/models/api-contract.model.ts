/**
 * Shared transport conventions for API-facing code.
 */

export type ApiId = string | number;

export type IsoDateString = string;
export type IsoDateTimeString = string;

export type Nullable<T> = T | null;

export interface RequestContext {
  correlationId?: string;
}
