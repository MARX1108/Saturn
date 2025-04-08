import fetch from "node-fetch";
import crypto from "crypto";
import { DateTime } from "luxon";

// Helper for making signed HTTP requests to other ActivityPub servers
export async function sendSignedRequest(
  url: string,
  body: any,
  privateKey: string,
  keyId: string,
) {
  const digest = crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("base64");

  const date = DateTime.now().toUTC().toRFC2822();
  const target = new URL(url);
  const path = target.pathname + target.search;

  // Create signature string
  const signString = [
    `(request-target): post ${path}`,
    `host: ${target.host}`,
    `date: ${date}`,
    `digest: SHA-256=${digest}`,
  ].join("\n");

  // Sign the string
  const signature = crypto
    .createSign("sha256")
    .update(signString)
    .sign(privateKey, "base64");

  // Create signature header
  const signatureHeader = [
    `keyId="${keyId}"`,
    'algorithm="rsa-sha256"',
    `headers="(request-target) host date digest"`,
    `signature="${signature}"`,
  ].join(",");

  // Make request with signature
  return fetch(url, {
    method: "POST",
    headers: {
      Host: target.host,
      Date: date,
      Digest: `SHA-256=${digest}`,
      Signature: signatureHeader,
      "Content-Type": "application/activity+json",
      Accept: "application/activity+json",
    },
    body: JSON.stringify(body),
  });
}

// Fetch remote actor profile
export async function fetchRemoteActor(actorUrl: string) {
  try {
    const response = await fetch(actorUrl, {
      headers: {
        Accept: "application/activity+json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch remote actor: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching remote actor:", error);
    throw error;
  }
}

// Send a follow request to a remote actor
export async function sendFollowRequest(
  fromActor: any,
  toActorUrl: string,
  privateKey: string,
) {
  try {
    // First fetch the target actor
    const toActor = await fetchRemoteActor(toActorUrl);

    // Create follow activity
    const followActivity = {
      "@context": "https://www.w3.org/ns/activitystreams",
      id: `${fromActor.id}/activities/${crypto.randomUUID()}`,
      type: "Follow",
      actor: fromActor.id,
      object: toActor.id,
      published: new Date().toISOString(),
    };

    // Send signed request to their inbox
    const response = await sendSignedRequest(
      toActor.inbox,
      followActivity,
      privateKey,
      `${fromActor.id}#main-key`,
    );

    if (!response.ok) {
      throw new Error(`Failed to send follow request: ${response.statusText}`);
    }

    return followActivity;
  } catch (error) {
    console.error("Error sending follow request:", error);
    throw error;
  }
}
