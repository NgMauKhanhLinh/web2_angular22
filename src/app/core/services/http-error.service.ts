import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import {
  AppHttpError,
  AppHttpErrorKind,
} from '../models/app-http-error.model';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorService {
  private readonly lastErrorState = signal<AppHttpError | null>(null);

  readonly lastError = this.lastErrorState.asReadonly();

  map(error: HttpErrorResponse): AppHttpError {
    const mapped = new AppHttpError(
      error.status,
      this.kindForStatus(error.status),
      this.messageForError(error),
      error.error,
    );

    this.lastErrorState.set(mapped);
    return mapped;
  }

  clear(): void {
    this.lastErrorState.set(null);
  }

  private kindForStatus(status: number): AppHttpErrorKind {
    if (status === 0) return 'network';
    if (status === 400) return 'bad-request';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not-found';
    if (status === 409) return 'conflict';
    if (status === 422) return 'validation';
    if (status === 423) return 'locked';
    if (status >= 500) return 'server';

    return 'unknown';
  }

  private messageForError(error: HttpErrorResponse): string {
    const backendMessage = this.extractBackendMessage(error.error);

    if (backendMessage) {
      return backendMessage;
    }

    switch (error.status) {
      case 0:
        return 'Unable to reach the server.';
      case 400:
        return 'The request is invalid.';
      case 401:
        return 'Authentication is required.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'The request conflicts with the current server state.';
      case 422:
        return 'The submitted data could not be processed.';
      case 423:
        return 'The account is temporarily locked.';
      default:
        return error.status >= 500
          ? 'The server encountered an error.'
          : 'An unexpected HTTP error occurred.';
    }
  }

  private extractBackendMessage(body: unknown): string | null {
    if (typeof body !== 'object' || body === null) {
      return null;
    }

    if (
      'detail' in body &&
      typeof (body as { detail?: unknown }).detail === 'string'
    ) {
      return (body as { detail: string }).detail;
    }

    if (
      'message' in body &&
      typeof (body as { message?: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
    }

    return null;
  }
}
