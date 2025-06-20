import {settings} from './settings.mjs';
import {helper} from './helper.mjs';
import {ItemMacroConfig} from './ItemMacroConfig.mjs';
import {SystemManager} from "./systems/SystemManager.mjs";
import "./v13Compatibility.mjs"; // Imports auto-initialize

Hooks.on('init', () => {
  console.log("Initializing");
  SystemManager.registerHandlers();
  settings.register();
  game.modules.get('itemacro').api = {
    handleSheetRender: (app, html, data) => {
      ItemMacroConfig._init(app, html, data);
    },
    handleContextMenu: (docType, options, html) => {
      if (docType === "Item") helper.addContext(options, "Directory");
    }
  };
});

Hooks.on('ready', () => {
  console.log("Ready");
  if (SystemManager.instance === null && game.user.isGM) {
    ui.notifications.warn(game.i18n.format("warning.systemNotSupported", {system: game.system.title}));
  }
  helper.register();
});
