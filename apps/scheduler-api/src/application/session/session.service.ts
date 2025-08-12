export interface SessionService {
  storeToken(ssuid: string, token: string): Promise<void>;
  renewSession(ssuid: string, token: string): Promise<void>;
  destroySession(ssuid: string, token: string): Promise<void>;
  isValidSession(ssuid: string, token: string): Promise<boolean>;
}
