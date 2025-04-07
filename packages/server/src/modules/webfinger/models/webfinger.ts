// WebFinger models for the webfinger module
export interface WebFingerLink {
  rel: string;
  type?: string;
  href?: string;
  template?: string;
}

export interface WebFingerResponse {
  subject: string;
  aliases?: string[];
  properties?: Record<string, unknown>;
  links: WebFingerLink[];
}