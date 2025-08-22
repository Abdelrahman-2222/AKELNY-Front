// export const environment = {
//   production: true,
//   apiUrl: 'https://akelni.tryasp.net',
//   googleClientId: '811631518025-je1km7ums6m720ct9v09vgvjtgr2qb24.apps.googleusercontent.com',
//   redirectUri: 'https://akelni.tryasp.net/auth/callback'
//   // ,
//   // facebookAppId: 'YOUR_PRODUCTION_FACEBOOK_APP_ID'
// };

// export const environment = {
//   production: true,
//   apiUrl: 'https://akelni.tryasp.net/api',
//   googleClientId: '811631518025-je1km7ums6m720ct9v09vgvjtgr2qb24.apps.googleusercontent.com',
//   redirectUri: 'https://akelni.tryasp.net/auth/callback'
// };

export const environment = {
  production: true,
  apiUrl: '/api', // Use relative path - Vercel will proxy to your HTTP backend
  googleClientId: '811631518025-je1km7ums6m720ct9v09vgvjtgr2qb24.apps.googleusercontent.com',
  redirectUri: 'https://akelny-front.vercel.app/auth/callback',
  uploadsUrl: 'https://akelni.tryasp.net'
};
