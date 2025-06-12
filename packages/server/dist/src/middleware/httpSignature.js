'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.verifyHttpSignature = verifyHttpSignature;
const crypto_1 = __importDefault(require('crypto'));
const federation_1 = require('../utils/federation');
/**
 * Parse HTTP Signature header
 */
function parseSignatureHeader(signatureHeader) {
  const parts = signatureHeader.split(',').map(part => part.trim());
  const parsed = {};
  for (const part of parts) {
    const [key, value] = part.split('=', 2);
    if (value) {
      parsed[key] = value.replace(/^"/, '').replace(/"$/, '');
    }
  }
  if (
    !parsed.keyId ||
    !parsed.algorithm ||
    !parsed.headers ||
    !parsed.signature
  ) {
    throw new Error('Invalid signature header format');
  }
  return {
    keyId: parsed.keyId,
    algorithm: parsed.algorithm,
    headers: parsed.headers.split(' '),
    signature: parsed.signature,
  };
}
/**
 * Create signature string from request headers
 */
function createSignatureString(req, headers) {
  const parts = [];
  for (const header of headers) {
    if (header === '(request-target)') {
      parts.push(`(request-target): ${req.method.toLowerCase()} ${req.url}`);
    } else {
      const value = req.headers[header.toLowerCase()];
      if (value) {
        parts.push(`${header.toLowerCase()}: ${value}`);
      } else {
        throw new Error(`Missing required header: ${header}`);
      }
    }
  }
  return parts.join('\n');
}
/**
 * Verify HTTP signature for ActivityPub federation
 */
async function verifyHttpSignature(req, res, next) {
  try {
    // Only verify signatures for ActivityPub inbox endpoints
    if (!req.path.includes('/inbox')) {
      return next();
    }
    const signatureHeader = req.headers.signature;
    if (!signatureHeader) {
      res.status(401).json({ error: 'Missing signature header' });
      return;
    }
    // Parse the signature header
    const parsedSig = parseSignatureHeader(signatureHeader);
    // Only support RSA-SHA256 for now
    if (parsedSig.algorithm !== 'rsa-sha256') {
      res.status(400).json({ error: 'Unsupported signature algorithm' });
      return;
    }
    // Extract actor URL from keyId (remove #main-key or similar fragment)
    const actorUrl = parsedSig.keyId.split('#')[0];
    // Fetch the remote actor to get their public key
    let remoteActor;
    try {
      remoteActor = await (0, federation_1.fetchRemoteActor)(actorUrl);
    } catch (error) {
      console.error(
        'Failed to fetch remote actor for signature verification:',
        error
      );
      res.status(401).json({ error: 'Could not fetch actor public key' });
      return;
    }
    // Extract public key
    let publicKeyPem;
    if (remoteActor.publicKey && remoteActor.publicKey.publicKeyPem) {
      publicKeyPem = remoteActor.publicKey.publicKeyPem;
    } else {
      res.status(401).json({ error: 'No public key found for actor' });
      return;
    }
    // Create the signature string from the request
    const signatureString = createSignatureString(req, parsedSig.headers);
    // Verify the signature
    const verifier = crypto_1.default.createVerify('sha256');
    verifier.update(signatureString);
    const isValid = verifier.verify(
      publicKeyPem,
      parsedSig.signature,
      'base64'
    );
    if (!isValid) {
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
    // Store the verified actor info for use in controllers
    req.verifiedActor = remoteActor;
    next();
  } catch (error) {
    console.error('HTTP signature verification error:', error);
    res.status(400).json({ error: 'Signature verification failed' });
  }
}
