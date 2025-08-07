export function sessionKey(ssuid: string, token: string): string {
    return `sess:${ssuid}:${token}`;
}
  