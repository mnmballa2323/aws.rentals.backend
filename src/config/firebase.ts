import admin from 'firebase-admin';
import { config } from './index';
import { logger } from '../utils/logger';

let firebaseApp: admin.app.App | undefined;

/**
 * Initializes Firebase Admin SDK.
 * Uses service account JSON file if FIREBASE_SERVICE_ACCOUNT_PATH is set,
 * otherwise falls back to Application Default Credentials (ADC) on GCP.
 */
export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const options: admin.AppOptions = {
      projectId: config.firebase.projectId || undefined,
    };

    if (config.firebase.serviceAccountPath) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(config.firebase.serviceAccountPath) as admin.ServiceAccount;
      options.credential = admin.credential.cert(serviceAccount);
    } else if (config.isProduction) {
      options.credential = admin.credential.applicationDefault();
    }

    firebaseApp = admin.initializeApp(options);
    logger.info('Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', error);
    throw error;
  }
}

/**
 * Returns the initialized Firebase Admin app instance.
 * @throws if Firebase has not been initialized
 */
export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    throw new Error('Firebase Admin SDK has not been initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

/**
 * Returns the Firebase Auth instance for token verification.
 */
export function getAuth(): admin.auth.Auth {
  return getFirebaseApp().auth();
}
