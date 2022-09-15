require('whatwg-fetch')

import { useEffect, useState } from 'react'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import type { AuthClient } from '../authClients'
import { AuthProvider } from '../AuthProvider'
import { useAuth } from '../useAuth'

type HasRoleAuthClient = AuthClient & {
  hasRole: (rolesToCheck?: string | string[]) => Promise<boolean | null>
}

let CURRENT_USER_DATA: {
  name: string
  email: string
  roles?: Array<string> | string
} = {
  name: 'Peter Pistorius',
  email: 'nospam@example.net',
}

global.RWJS_API_GRAPHQL_URL = '/.netlify/functions/graphql'

const server = setupServer(
  graphql.query('__REDWOOD__AUTH_GET_CURRENT_USER', (_req, res, ctx) => {
    return res(
      ctx.data({
        redwood: {
          currentUser: CURRENT_USER_DATA,
        },
      })
    )
  })
)
beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  server.resetHandlers()
  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
  }
})

const AuthConsumer = () => {
  const {
    loading,
    isAuthenticated,
    logOut,
    logIn,
    getToken,
    userMetadata,
    currentUser,
    reauthenticate,
    hasError,
    hasRole,
    error,
  } = useAuth()

  const [authToken, setAuthToken] = useState(null)

  useEffect(() => {
    const retrieveToken = async () => {
      const token = await getToken()
      setAuthToken(token)
    }
    retrieveToken()
  }, [getToken])

  if (loading) {
    return <>Loading...</>
  }

  if (hasError) {
    return <>{error.message}</>
  }

  return (
    <>
      <button
        onClick={() => {
          isAuthenticated ? logOut() : logIn()
        }}
      >
        {isAuthenticated ? 'Log Out' : 'Log In'}
      </button>

      {isAuthenticated && (
        <>
          <p>userMetadata: {JSON.stringify(userMetadata)}</p>
          <p>authToken: {authToken}</p>
          <p>
            currentUser:{' '}
            {(currentUser && JSON.stringify(currentUser)) ||
              'no current user data'}
          </p>
          <p>Has Admin: {hasRole('admin') ? 'yes' : 'no'}</p>
          <p>Has Super User: {hasRole('superuser') ? 'yes' : 'no'}</p>
          <p>Has Admin as Array: {hasRole(['admin']) ? 'yes' : 'no'}</p>
          <p>Has Editor: {hasRole(['editor', 'publisher']) ? 'yes' : 'no'}</p>
          <p>
            Has Editor or Author: {hasRole(['editor', 'author']) ? 'yes' : 'no'}
          </p>

          <button onClick={() => reauthenticate()}>Update auth data</button>
        </>
      )}
    </>
  )
}

/**
 * A logged out user can login, view their personal account information and logout.
 */
test('Authentication flow (logged out -> login -> logged in -> logout) works as expected', async () => {
  const mockAuthClient: AuthClient = {
    login: async () => {
      return true
    },
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => {
      return null
    }),
    client: () => {},
    type: 'custom',
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)
  expect(
    screen.getByText(
      'userMetadata: {"sub":"abcdefg|123456","username":"peterp"}'
    )
  ).toBeInTheDocument()
  expect(
    screen.getByText(
      'currentUser: {"name":"Peter Pistorius","email":"nospam@example.net"}'
    )
  ).toBeInTheDocument()
  expect(screen.getByText('authToken: hunter2')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

test('Fetching the current user can be skipped', async () => {
  const mockAuthClient: AuthClient = {
    login: async () => {
      return true
    },
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => {
      return null
    }),
    client: () => {},
    type: 'custom',
  }
  render(
    <AuthProvider client={mockAuthClient} type="custom" skipFetchCurrentUser>
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)
  expect(screen.getByText(/no current user data/)).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * This is especially helpful if you want to update the currentUser state.
 */
test('A user can be reauthenticated to update the "auth state"', async () => {
  const mockAuthClient: AuthClient = {
    login: async () => {
      return true
    },
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => {
      return null
    }),
    client: () => {},
    type: 'custom',
  }
  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))
  expect(mockAuthClient.getUserMetadata).toBeCalledTimes(1)

  // The original current user data is fetched.
  expect(
    screen.getByText(
      'currentUser: {"name":"Peter Pistorius","email":"nospam@example.net"}'
    )
  ).toBeInTheDocument()

  CURRENT_USER_DATA = { ...CURRENT_USER_DATA, name: 'Rambo' }
  fireEvent.click(screen.getByText('Update auth data'))

  await waitFor(() =>
    screen.getByText(
      'currentUser: {"name":"Rambo","email":"nospam@example.net"}'
    )
  )
})

test('When the current user cannot be fetched the user is not authenticated', async () => {
  server.use(
    graphql.query('__REDWOOD__AUTH_GET_CURRENT_USER', (_req, res, ctx) => {
      return res(ctx.status(404))
    })
  )

  const mockAuthClient: AuthClient = {
    login: async () => {
      return true
    },
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => {
      return {
        sub: 'abcdefg|123456',
        username: 'peterp',
      }
    }),
    client: () => {},
    type: 'custom',
  }
  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() =>
    screen.getByText('Could not fetch current user: Not Found (404)')
  )
})

/**
 * Check assigned role access
 */
test('Authenticated user has assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => {
      return true
    },
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => {
      return null
    }),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: [],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  screen.debug()

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Admin: no')).toBeInTheDocument()
  expect(screen.getByText('Has Super User: no')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check unassigned role access
 */
test('Authenticated user has not been assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['admin', 'superuser'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Admin: yes')).toBeInTheDocument()
  expect(screen.getByText('Has Super User: yes')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check some unassigned role access
 */
test('Authenticated user has not been assigned some role access but not others as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['admin'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Admin: yes')).toBeInTheDocument()
  expect(screen.getByText('Has Super User: no')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check assigned role access when specified as single array element
 */
test('Authenticated user has assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['admin'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Admin as Array: yes')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check assigned role access when specified as array element
 */
test('Authenticated user has assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => true,
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['admin'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Admin as Array: yes')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

test('Checks roles successfully when roles in currentUser is a string', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => {},
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: 'admin',
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  expect(screen.getByText('Has Admin: yes')).toBeInTheDocument()
  expect(screen.getByText('Has Admin as Array: yes')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check if assigned one of the roles in an array
 */
test('Authenticated user has assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => true,
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['editor'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })

  expect(screen.getByText('Has Editor: yes')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

/**
 * Check if not assigned any of the roles in an array
 */
test('Authenticated user has assigned role access as expected', async () => {
  const mockAuthClient: HasRoleAuthClient = {
    login: async () => true,
    signup: async () => true,
    logout: async () => {},
    getToken: async () => 'hunter2',
    getUserMetadata: jest.fn(async () => null),
    hasRole: jest.fn(async () => null),
    client: () => {},
    type: 'custom',
  }

  CURRENT_USER_DATA = {
    name: 'Peter Pistorius',
    email: 'nospam@example.net',
    roles: ['admin'],
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <AuthConsumer />
    </AuthProvider>
  )

  // We're booting up!
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // The user is not authenticated
  await waitFor(() => screen.getByText('Log In'))

  expect(screen.queryByText('Has Admin:')).not.toBeInTheDocument()
  expect(screen.queryByText('Has Super User:')).not.toBeInTheDocument()

  // Replace "getUserMetadata" with actual data, and login!
  mockAuthClient.getUserMetadata = jest.fn(async () => {
    return {
      sub: 'abcdefg|123456',
      username: 'peterp',
    }
  })
  fireEvent.click(screen.getByText('Log In'))

  // Check that you're logged in!
  await waitFor(() => screen.getByText('Log Out'))

  mockAuthClient.hasRole = jest.fn(async () => {
    return true
  })
  expect(screen.getByText('Has Admin: yes')).toBeInTheDocument()
  expect(screen.getByText('Has Editor: no')).toBeInTheDocument()
  expect(screen.getByText('Has Editor or Author: no')).toBeInTheDocument()

  // Log out
  fireEvent.click(screen.getByText('Log Out'))
  await waitFor(() => screen.getByText('Log In'))
})

test('proxies forgotPassword() calls to client', async () => {
  const mockAuthClient = {
    forgotPassword: async (args) => {
      expect(args).toEqual('username')
    },
    client: () => {},
    type: 'custom',
  }

  const TestAuthConsumer = () => {
    const { forgotPassword } = useAuth()
    forgotPassword('username')

    return null
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <TestAuthConsumer />
    </AuthProvider>
  )

  // for whatever reason, forgotPassword is invoked twice
  expect.assertions(2)
})

test('proxies resetPassword() calls to client', async () => {
  const mockAuthClient = {
    resetPassword: async (args) => {
      expect(args).toEqual('password')
    },
    client: () => {},
    type: 'custom',
  }

  const TestAuthConsumer = () => {
    const { resetPassword } = useAuth()
    resetPassword('password')

    return null
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <TestAuthConsumer />
    </AuthProvider>
  )

  // for whatever reason, forgotPassword is invoked twice
  expect.assertions(2)
})

test('proxies validateResetToken() calls to client', async () => {
  const mockAuthClient = {
    validateResetToken: async (args) => {
      expect(args).toEqual('12345')
    },
    client: () => {},
    type: 'custom',
  }

  const TestAuthConsumer = () => {
    const { validateResetToken } = useAuth()
    validateResetToken('12345')

    return null
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <TestAuthConsumer />
    </AuthProvider>
  )

  // for whatever reason, validateResetToken is invoked twice
  expect.assertions(2)
})

test('getToken doesnt fail if client throws an error', async () => {
  const mockAuthClient = {
    getToken: async () => {
      throw 'Login Required'
    },
    type: 'custom',
  }

  const TestAuthConsumer = () => {
    const { getToken } = useAuth()
    const [authTokenResult, setAuthTokenResult] = useState(null)

    useEffect(() => {
      const getTokenAsync = async () => {
        let token

        // If the getToken function throws we will catch it
        // here which will let us know that something is wrong.
        try {
          token = await getToken()
          setAuthTokenResult({ success: true, token })
        } catch (error) {
          setAuthTokenResult({ success: false, token: 'FAIL' })
        }
      }

      getTokenAsync()
    }, [getToken])

    return <div>Token: {`${authTokenResult?.token}`}</div>
  }

  render(
    <AuthProvider client={mockAuthClient} type="custom">
      <TestAuthConsumer />
    </AuthProvider>
  )

  await waitFor(() => screen.getByText('Token: null'))
})
