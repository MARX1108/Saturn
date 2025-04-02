import { Request } from "express";
import { ServiceContainer } from "../utils/container";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        [key: string]: any;
      };
      services: ServiceContainer;
    }
  }
}

export {};
