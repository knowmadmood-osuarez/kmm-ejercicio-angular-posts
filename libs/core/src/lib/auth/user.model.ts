export interface User {
  id: string;
  name: string;
  password: string;
  email: string;
  avatar: string;
}

/** User without sensitive fields — safe to store in memory / localStorage. */
export type SafeUser = Omit<User, 'password'>;
