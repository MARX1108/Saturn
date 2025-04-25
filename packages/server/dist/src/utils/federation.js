'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.sendSignedRequest = sendSignedRequest;
exports.fetchRemoteActor = fetchRemoteActor;
exports.sendFollowRequest = sendFollowRequest;
exports.fetchRemoteObject = fetchRemoteObject;
exports.sendActivity = sendActivity;
const node_fetch_1 = __importDefault(require('node-fetch'));
const crypto_1 = __importDefault(require('crypto'));
const luxon_1 = require('luxon');
// Helper for making signed HTTP requests to other ActivityPub servers
async function sendSignedRequest(url, body, privateKey, keyId) {
  const digest = crypto_1.default
    .createHash('sha256')
    .update(JSON.stringify(body))
    .digest('base64');
  const date = luxon_1.DateTime.now().toUTC().toRFC2822();
  const target = new URL(url);
  const path = target.pathname + target.search;
  // Create signature string
  const signString = [
    `(request-target): post ${path}`,
    `host: ${target.host}`,
    `date: ${date}`,
    `digest: SHA-256=${digest}`,
  ].join('\n');
  // Sign the string
  const signature = crypto_1.default
    .createSign('sha256')
    .update(signString)
    .sign(privateKey, 'base64');
  // Create signature header
  const signatureHeader = [
    `keyId="${keyId}"`,
    'algorithm="rsa-sha256"',
    `headers="(request-target) host date digest"`,
    `signature="${signature}"`,
  ].join(',');
  // Make request with signature
  const response = await (0, node_fetch_1.default)(url, {
    method: 'POST',
    headers: {
      Host: target.host,
      Date: date,
      Digest: `SHA-256=${digest}`,
      Signature: signatureHeader,
      'Content-Type': 'application/activity+json',
      Accept: 'application/activity+json',
    },
    body: JSON.stringify(body),
  });
  return response;
}
// Fetch remote actor profile
async function fetchRemoteActor(actorUrl) {
  try {
    const response = await (0, node_fetch_1.default)(actorUrl, {
      headers: {
        Accept: 'application/activity+json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch remote actor: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/activity+json')) {
      throw new Error('Invalid content type received');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching remote actor:', error);
    throw error;
  }
}
// Send a follow request to a remote actor
async function sendFollowRequest(fromActor, toActorUrl, privateKey) {
  try {
    // First fetch the target actor
    const toActor = await fetchRemoteActor(toActorUrl);
    // Create follow activity
    const followActivity = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${fromActor.id}/activities/${crypto_1.default.randomUUID()}`,
      type: 'Follow',
      actor: fromActor.id,
      object: toActor.id,
      published: new Date().toISOString(),
    };
    // Send signed request to their inbox
    const response = await sendSignedRequest(
      String(toActor.inbox),
      followActivity,
      privateKey,
      `${fromActor.id}#main-key`
    );
    if (!response.ok) {
      throw new Error(`Failed to send follow request: ${response.statusText}`);
    }
    return followActivity;
  } catch (error) {
    console.error('Error sending follow request:', error);
    throw error;
  }
}
async function fetchRemoteObject(url) {
  const response = await (0, node_fetch_1.default)(url, {
    headers: {
      Accept: 'application/activity+json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch remote object: ${response.statusText}`);
  }
  return response.json();
}
async function sendActivity(url, activity) {
  const response = await (0, node_fetch_1.default)(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/activity+json',
      Accept: 'application/activity+json',
    },
    body: JSON.stringify(activity),
  });
  if (!response.ok) {
    throw new Error(`Failed to send activity: ${response.statusText}`);
  }
}
