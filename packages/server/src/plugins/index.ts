import { Request, Response, Application } from 'express';

export interface ServerPlugin {
  name: string;
  version: string;
  init?: (app: Application) => void;
  onNewPost?: (postData: any) => void;
}

const plugins: ServerPlugin[] = [];

export function registerPlugin(plugin: ServerPlugin) {
  console.log(`Registering plugin: ${plugin.name} v${plugin.version}`);
  plugins.push(plugin);
}

export function initPlugins(app: Application) {
  for (const plugin of plugins) {
    if (plugin.init) {
      plugin.init(app);
      console.log(`Initialized plugin: ${plugin.name}`);
    }
  }
}

export function triggerHook(hookName: string, data: any) {
  plugins.forEach(plugin => {
    const hook = plugin[hookName as keyof ServerPlugin];
    if (typeof hook === 'function') {
      hook(data);
    }
  });
}
