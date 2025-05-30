import {settings} from './settings.mjs';
import {helper} from './helper.mjs';
import {ItemMacroConfig} from './ItemMacroConfig.mjs';
import {SystemManager} from "./systems/SystemManager.mjs";

Hooks.on('init', () => {
  console.log("Initializing");
  SystemManager.registerHandlers();
  settings.register();
});

Hooks.on('ready', () => {
  console.log("Ready");
  if (SystemManager.instance === null && game.user.isGM) {
    ui.notifications.warn(game.i18n.format("warning.systemNotSupported", {system: game.system.title}));
  }
  helper.register();
});

// Hooks.on('renderItemSheet', ItemMacroConfig._init);
Hooks.on("render", (app, html, data) => {
  if (app instanceof ItemSheetV2) { // Check for the v2 Item Sheet
    console.log("Rendering ItemSheetV2", {app, html, data});
    ItemMacroConfig._init(app, html, data);
  }
});

// Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "Directory"));
Hooks.on("getDirectoryEntryContext", (html, entryOptions) => {
  if (app.documentName === "Item") helper.addContext(entryOptions, "Directory");
});