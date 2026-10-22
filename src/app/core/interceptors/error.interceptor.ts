import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { HttpErrorService } from '../services/http-error.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const httpErrorService = inject(HttpErrorService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() => httpErrorService.map(error));
      }

      return throwError(() => error);
    }),
  );
};
