import {settings} from './settings.mjs';

export class logger {
  static info(...args) {
    console.log(`${settings?.data?.title || ""}  | `, ...args);
  }

  static debug(...args) {
    if (settings.value('debug') && game.modules.get('_dev-mode')?.api?.getPackageDebugValue('itemacro'))
      this.info("DEBUG | ", ...args);
  }

  static error(...args) {
    console.error(`${settings?.data?.title || ""} | ERROR | `, ...args);
  }
}