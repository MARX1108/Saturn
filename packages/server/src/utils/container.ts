import { Db } from "mongodb";
import { ActorRepository } from "../repositories/actorRepository";
import { PostRepository } from "../repositories/postRepository";
import { ActorService } from "../services/actorService";
import { PostService } from "../services/postService";
import { WebFingerService } from "../services/webfingerService";

export interface ServiceContainer {
  // Repositories
  actorRepository: ActorRepository;
  postRepository: PostRepository;
  
  // Services
  actorService: ActorService;
  postService: PostService;
  webfingerService: WebFingerService;
}

export function createServiceContainer(db: Db, domain: string): ServiceContainer {
  // Create repositories
  const actorRepository = new ActorRepository(db);
  const postRepository = new PostRepository(db);
  
  // Create services with repositories
  const actorService = new ActorService(db, domain);
  const postService = new PostService(db, domain);
  const webfingerService = new WebFingerService(db, domain);
  
  return {
    // Repositories
    actorRepository,
    postRepository,
    
    // Services
    actorService,
    postService,
    webfingerService,
  };
}
