# Integrations

## <Service name>
- Purpose: <what the product uses it for>
- Env vars: `<SERVICE_API_KEY>` (read only in `src/config/env.ts`)
- Limits: <rate limit, payload size, timeout>
- Contract we rely on: <request/response fields that matter>
- Test double: `<FakeServiceGateway>` — <behavior: fixed response, configurable failure>
- Failure policy: <retry / backoff / user-facing message>
