// ActivityPub models for the activitypub module
export interface ActivityPubObject {
  "@context": string | string[];
  id: string;
  type: string;
  [key: string]: any;
}

export interface ActivityPubActivity extends ActivityPubObject {
  actor: string;
  object: ActivityPubObject | string;
}

export interface ActivityPubCollection extends ActivityPubObject {
  totalItems: number;
  items?: ActivityPubObject[];
  orderedItems?: ActivityPubObject[];
  first?: string;
  last?: string;
  current?: string;
}

export interface ActivityPubOrderedCollection extends ActivityPubCollection {
  orderedItems: ActivityPubObject[];
}

export interface ActivityPubCollectionPage extends ActivityPubCollection {
  partOf: string;
  next?: string;
  prev?: string;
}
