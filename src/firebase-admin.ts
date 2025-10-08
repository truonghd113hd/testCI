import * as admin from 'firebase-admin';

const app = admin.initializeApp({
  // credential: admin.credential.cert({
  //   projectId: process.env.FB_PROJECT_ID,
  //   clientEmail: process.env.FB_CLIENT_EMAIL,
  //   privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  // }),
});

export { admin, app };
