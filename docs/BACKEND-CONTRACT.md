# Backend Contract - Confirmation Checklist

This file prevents the Angular frontend from hard-coding assumptions inherited from the previous React implementation.

Status: **TBD / awaiting Backend confirmation**

## API Base

- [ ] Development API base URL:
- [ ] Production/staging API base URL:
- [ ] API prefix, e.g. `/api` or `/api/v1`:
- [ ] API documentation/Postman collection link:

## Authentication

- [ ] Login endpoint:
- [ ] Login HTTP method:
- [ ] Login request body:
- [ ] Successful login response example:
- [ ] Access-token field name:
- [ ] Access-token expiration behavior:
- [ ] Refresh-token mechanism:
- [ ] Refresh endpoint:
- [ ] Refresh request/response example:
- [ ] Is refresh token stored in an HttpOnly cookie?
- [ ] Does frontend need `withCredentials: true`?
- [ ] Logout endpoint:

## Authorization

Confirm exact role codes returned by Backend:

- [ ] Customer:
- [ ] Admin:
- [ ] Doctor:
- [ ] Staff/other roles:

Confirm where role information is returned:
- [ ] Login response.
- [ ] JWT claims.
- [ ] User profile endpoint.
- [ ] Other:

## API Response Envelope

Provide one success example:

```json
{
  "TBD": true
}
```

Provide one validation/error example:

```json
{
  "TBD": true
}
```

Confirm fields for:
- [ ] Data.
- [ ] Message.
- [ ] Error code.
- [ ] Validation errors.
- [ ] Pagination metadata.

## HTTP Status Behavior

Confirm expected behavior for:
- [ ] 400.
- [ ] 401.
- [ ] 403.
- [ ] 404.
- [ ] 409.
- [ ] 422.
- [ ] 500.

## CORS

- [ ] Allowed frontend origins.
- [ ] Credentials enabled/disabled.
- [ ] Required custom headers.
- [ ] Local development requirements.

## Migration Note

The legacy React frontend used a Bearer-token style API client and contained refresh-token handling, but the Angular implementation must not assume those details are still authoritative until Backend confirms this checklist.
