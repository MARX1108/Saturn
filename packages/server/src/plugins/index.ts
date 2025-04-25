import { Application } from 'express';
import { Post } from '../modules/posts/models/post';

export interface HookData {
  [key: string]: unknown;
}

export interface ServerPlugin {
  name: string;
  version: string;
  init?: (app: Application) => void;
  hooks?: {
    [hookName: string]: (data: HookData) => void | Promise<void>;
  };
  onNewPost?(postData: Post): void;
}

const plugins: ServerPlugin[] = [];
const hooks: {
  [hookName: string]: Array<(data: HookData) => void | Promise<void>>;
} = {};

export function registerPlugin(plugin: ServerPlugin): void {
  console.log(`Registering plugin: ${plugin.name} v${plugin.version}`);
  plugins.push(plugin);

  // Register hooks
  if (plugin.hooks) {
    Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
      if (!hooks[hookName]) {
        hooks[hookName] = [];
      }
      hooks[hookName].push(handler);
    });
  }
}

export function initPlugins(app: Application): void {
  for (const plugin of plugins) {
    if (plugin.init) {
      plugin.init(app);
    }
  }
}

export async function executeHook(
  hookName: string,
  data: HookData = {}
): Promise<void> {
  const hookHandlers = hooks[hookName] || [];
  for (const handler of hookHandlers) {
    await Promise.resolve(handler(data));
  }
}
