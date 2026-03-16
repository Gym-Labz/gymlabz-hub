/**
 * Decodifica o payload do JWT (sem verificar assinatura - apenas leitura no client).
 * A validação real é feita pelo backend em cada requisição.
 */
export function decodeJwtPayload(token: string): { profile?: string; type?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}
