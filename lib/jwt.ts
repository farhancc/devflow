const JWT_SECRET = process.env.JWT_SECRET || 'designflow-super-secret-key-123456789-abcdef';

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export interface JWTPayload {
  id: string;
  username: string;
  role: 'manager' | 'designer';
  fullName: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const encodedPayload = uint8ArrayToBase64url(encoder.encode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  })));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(tokenInput)
  );
  
  const encodedSignature = uint8ArrayToBase64url(new Uint8Array(signature));
  
  return `${tokenInput}.${encodedSignature}`;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const tokenInput = `${encodedHeader}.${encodedPayload}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = base64urlToUint8Array(encodedSignature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(tokenInput)
    );
    
    if (!isValid) return null;
    
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(base64urlToUint8Array(encodedPayload))) as JWTPayload;
    
    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}
