import {getTokens, getUser, isAuthenticated} from '../services/tokenService';

export const debugAuthStatus = async () => {
  console.log('=== AUTH DEBUG ===');

  try {
    const tokens = await getTokens();
    console.log(
      'Tokens:',
      tokens
        ? {
            hasAccessToken: !!tokens.accessToken,
            hasRefreshToken: !!tokens.refreshToken,
            expiresAt: tokens.expiresAt
              ? new Date(tokens.expiresAt)
              : 'No expiry',
            isExpired: tokens.expiresAt
              ? Date.now() > tokens.expiresAt
              : 'Unknown',
          }
        : 'No tokens found',
    );

    const user = await getUser();
    console.log(
      'User:',
      user
        ? {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          }
        : 'No user found',
    );

    const authenticated = await isAuthenticated();
    console.log('Is Authenticated:', authenticated);

    if (tokens?.accessToken) {
      console.log(
        'Token preview:',
        tokens.accessToken.substring(0, 20) + '...',
      );
    }
  } catch (error) {
    console.error('Debug error:', error);
  }

  console.log('=== END DEBUG ===');
};
