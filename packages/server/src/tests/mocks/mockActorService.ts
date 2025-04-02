import { ObjectId } from "mongodb";

export class MockActorService {
  private actors = new Map();
  private domain: string;

  constructor(domain = "test.domain") {
    this.domain = domain;
  }

  async usernameExists(username: string): Promise<boolean> {
    return this.actors.has(username);
  }

  async getActorByUsername(username: string): Promise<any> {
    return this.actors.get(username) || null;
  }

  async createActor(actorData: any, iconInfo?: any): Promise<any> {
    const actor = {
      _id: new ObjectId(),
      preferredUsername: actorData.username,
      name: actorData.displayName || actorData.username,
      summary: actorData.bio || "",
      id: `https://${this.domain}/users/${actorData.username}`,
      inbox: `https://${this.domain}/users/${actorData.username}/inbox`,
      outbox: `https://${this.domain}/users/${actorData.username}/outbox`,
      followers: `https://${this.domain}/users/${actorData.username}/followers`,
      following: `https://${this.domain}/users/${actorData.username}/following`,
      type: "Person",
      icon: iconInfo || undefined,
    };

    this.actors.set(actorData.username, actor);
    return actor;
  }

  async updateActor(
    username: string,
    updates: any,
    iconInfo?: any
  ): Promise<any> {
    const actor = this.actors.get(username);
    if (!actor) {
      return null;
    }

    const updatedActor = {
      ...actor,
      name: updates.displayName || actor.name,
      summary: updates.bio || actor.summary,
      icon: iconInfo || actor.icon,
    };

    this.actors.set(username, updatedActor);
    return updatedActor;
  }

  async deleteActor(username: string): Promise<boolean> {
    if (!this.actors.has(username)) {
      return false;
    }

    this.actors.delete(username);
    return true;
  }
}
