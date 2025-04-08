declare module "activitypub-express" {
  import { Express } from "express";

  interface ApexOptions {
    name?: string;
    domain: string;
    actorParam?: string;
    objectParam?: string;
    routes?: {
      actor?: string;
      object?: string;
      activity?: string;
      inbox?: string;
      outbox?: string;
      followers?: string;
      following?: string;
      liked?: string;
    };
    endpoints?: {
      proxyUrl?: string;
      uploadMedia?: string;
      main?: string;
    };
    storage?: {
      db: any;
      activities?: string;
      actors?: string;
      objects?: string;
      streams?: string;
    };
    [key: string]: any;
  }

  interface ApexInstance {
    [key: string]: any;
    createKeypair(): Promise<{ publicKey: string; privateKey: string }>;
    store: {
      activities: any;
      actors: any;
      objects: any;
      streams: any;
      [key: string]: any;
    };
  }

  function apex(options: ApexOptions): ApexInstance & Express;

  export = apex;
}
