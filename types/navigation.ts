export interface UserData {
  name: string;
  email: string;
  image?: string;
}

export interface AuthCallbacks {
  onSignIn?: () => void;
  onProfileClick?: () => void;
}
