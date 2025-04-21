'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.registerPlugin = registerPlugin;
exports.initPlugins = initPlugins;
exports.executeHook = executeHook;
const plugins = [];
const hooks = {};
function registerPlugin(plugin) {
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
function initPlugins(app) {
  for (const plugin of plugins) {
    if (plugin.init) {
      plugin.init(app);
    }
  }
}
async function executeHook(hookName, data = {}) {
  const hookHandlers = hooks[hookName] || [];
  for (const handler of hookHandlers) {
    await Promise.resolve(handler(data));
  }
}
