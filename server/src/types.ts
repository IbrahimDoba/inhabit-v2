import type { auth } from './auth.js';

type Session = typeof auth.$Infer.Session;

/** Hono context variables set by the session middleware. */
export type AppEnv = {
  Variables: {
    user: Session['user'];
    session: Session['session'];
  };
};
