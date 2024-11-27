import admins from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handling the newlines in the private key
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admins.initializeApp({
  credential: admins.credential.cert(serviceAccount),
});

export { admins };
