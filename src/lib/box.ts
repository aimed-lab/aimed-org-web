import { BoxClient, BoxDeveloperTokenAuth } from "box-typescript-sdk-gen"

let _client: BoxClient | null = null

/**
 * Get a Box API client using the developer token.
 * Note: Developer tokens expire after 60 minutes; for production use,
 * switch to OAuth2 or JWT-based auth.
 */
export function getBoxClient(): BoxClient {
  const token = process.env.BOX_DEVELOPER_TOKEN
  if (!token) {
    throw new Error("BOX_DEVELOPER_TOKEN is not set")
  }

  if (!_client) {
    const auth = new BoxDeveloperTokenAuth({ token })
    _client = new BoxClient({ auth })
  }

  return _client
}
