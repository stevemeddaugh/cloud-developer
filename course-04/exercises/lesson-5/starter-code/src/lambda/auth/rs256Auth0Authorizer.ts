
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = 'MIIDDTCCAfWgAwIBAgIJIlSJHnbZRf4zMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi0zOW9lMzhzMC51cy5hdXRoMC5jb20wHhcNMjAxMDE1MjMxNDM4WhcNMzQwNjI0MjMxNDM4WjAkMSIwIAYDVQQDExlkZXYtMzlvZTM4czAudXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAppr8C0QXxsCu+ydowBBGlMl91D3b5exGmRnty/5WivogjWWZYsUaA4g86+j8U+MtVOuSUPs01w6PPMJX3JYrRcSvr3aUFKXxMuKbxZedmVk632TZ3kEV9QBsEcTY36r6JVkujG6lpxerdkpRAsnAvE3QEk+DsCtcfaD8wyhttt0Az7q4LvZcXHYbJJmD7A4qUofdP8HwrmBrIkfffe83CeSNqlThUm9yuKijyXUoJpTYzJu9qro/CqlU7dSKGAkUDaT1B2V77lKH1xKiNb86FcBdxcx7mSTez3gJ+79X2Tc94zYEDSRjEZwYv3HWhKRmsfAP0sVre/ooGx0FQQR3hQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRqHbRygxdGJV7Vw3liy/1HbVjNmzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAKBEU5GjvmhCTDCxW/AsEOwtJXhGlVgZDVsIO1zhG0f+olga4/Gs7t93eTR+JYS5hQ+VPoq9HdSjy0ZDNlYAmHtwEUFTC7b5Z9lR6AGC2w7lP6jWwJ6ksbpCiPoqJqbPB9VrYWY3xAk7gSZxPATy1ETFTdBbj6Rbox5LwmgHgsFpRnuizwCpvflrEJvzJIF9AMdX2gnPIznBbqZbEmaUPOexY5wlQPEgKEUp0Hj9VKQqrzk57ovIuE7ZkVe8Fqs2jAcJQ2/bSDq+gSVHKGfKkQzohtBEtFqX6Y8/UeDDcLrDM8rOr5g5T0VQTLGbIfMmljjVLS0uzYN3ZZp6H5tTlqE='

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
