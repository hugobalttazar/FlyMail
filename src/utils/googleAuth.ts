import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Account } from '../types/mail';

// Inicializa a instância do Firebase de forma segura e idempotente
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

const googleProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cache em memória do access token para uso seguro durante a sessão (Security by Design)
let inMemoryAccessToken: string | null = null;
let isSigningIn = false;

export const getGoogleAccessToken = (): string | null => {
  return inMemoryAccessToken;
};

/**
 * Realiza o login direto com a conta Google via popup oficial do Google.
 * Retorna os dados do usuário autenticado e a nova conta gerada para o FlyMail.
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string; account: Account } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso seguro da conta Google.');
    }

    inMemoryAccessToken = credential.accessToken;
    const user = result.user;

    const email = user.email || 'usuario@gmail.com';
    const name = user.displayName || email.split('@')[0];
    const avatar = user.photoURL || undefined;

    const account: Account = {
      id: `google_${user.uid}`,
      name,
      email,
      avatar,
      color: '#EA4335', // Vermelho Google característico
      unreadCount: 0,
      provider: 'google',
      isDefault: true,
      connectionConfig: {
        providerType: 'google',
        incomingHost: 'imap.gmail.com',
        incomingPort: 993,
        incomingSecurity: 'SSL',
        outgoingHost: 'smtp.gmail.com',
        outgoingPort: 465,
        outgoingSecurity: 'SSL',
        username: email,
        passwordOrToken: 'OAuth2_Secured',
        isVerified: true,
      },
    };

    return { user, accessToken: inMemoryAccessToken, account };
  } catch (error: any) {
    console.error('[FlyMail Auth] Erro ao autenticar com o Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Desconecta a sessão do Google e limpa o token em memória
 */
export const signOutGoogle = async (): Promise<void> => {
  try {
    await signOut(auth);
    inMemoryAccessToken = null;
  } catch (err) {
    console.error('[FlyMail Auth] Erro ao desconectar Google:', err);
  }
};

/**
 * Observador de estado de autenticação
 */
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user && !isSigningIn) {
      inMemoryAccessToken = null;
    }
    callback(user);
  });
};
