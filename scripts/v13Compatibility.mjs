import { logger } from "./logger.mjs";

/**
 * Foundry VTT v13+ Compatibility Layer
 * Centralizes v13-specific adaptations while maintaining v12 support
 */
export class V13Compatibility {
    static init() {
        this.isV13 = game.release?.generation >= 13;
        if (!this.isV13) return;

        logger.info("Initializing v13 Compatibility Layer");
        this.applyCorePatches();
        this.registerHooks();
    }

    /**
     * Core API polyfills and patches
     */
    static applyCorePatches() {
        // 1. ApplicationV2 polyfills
        if (!globalThis.DocumentSheetV2) {
            globalThis.DocumentSheetV2 = class DocumentSheetV2 {};
        }

        // 2. Token document access normalization
        if (!TokenDocument.prototype.getEmbeddedCollection) {
            TokenDocument.prototype.getEmbeddedCollection = 
                TokenDocument.prototype.getEmbeddedDocuments;
        }

        // 3. Scene data access normalization
        if (Scene.prototype.tokens === undefined) {
            Object.defineProperty(Scene.prototype, 'tokens', {
                get() { return this.data.tokens; }
            });
        }
    }

    /**
     * Version-specific hook registrations
     */
    static registerHooks() {
        // 1. Sheet rendering compatibility
        Hooks.on('renderDocumentSheet', this.handleSheetRender.bind(this));
        
        // 2. Directory context menu normalization
        Hooks.on('getDirectoryEntryContext', this.normalizeContextMenu.bind(this));
        
        // 3. Canvas initialization patches
        Hooks.on('canvasInit', this.patchCanvas.bind(this));
    }

    /**
     * Handle document sheet rendering with v13/v12 differences
     */
    static handleSheetRender(app, html, data) {
        // Unified sheet type detection
        const isItemSheet = app.document?.documentName === "Item";
        const isV2Sheet = app.constructor.name.endsWith("SheetV2");
        
        if (isItemSheet && (this.isV13 || isV2Sheet)) {
            // Forward to module's sheet handler
            game.modules.get('itemacro')?.api?.handleSheetRender?.(app, html, data);
        }
    }

    /**
     * Normalize context menu for v13's unified system
     */
    static normalizeContextMenu(html, entryOptions) {
        const appId = html.closest('[data-app-id]')?.dataset?.appId;
        if (!appId) return;
        
        const app = ui.windows[appId];
        if (!app) return;

        // Forward to module's context handler with document type
        const documentType = app.documentName;
        game.modules.get('itemacro')?.api?.handleContextMenu?.(
            documentType, 
            entryOptions, 
            html
        );
    }

    /**
     * Canvas-specific patches
     */
    static patchCanvas() {
        // Token control icon adjustments
        canvas.hud.token.children.forEach(hud => {
            const icon = hud.children.find(c => c.constructor.name === "ControlIcon");
            if (icon) {
                icon.position.set(0, -40); // Adjust for v13 UI changes
            }
        });
    }

    /**
     * API version normalization
     */
    static getDocumentUuid(doc) {
        if (this.isV13) {
            return doc.uuid; // v13 uses direct uuid property
        }
        // v12 compatibility
        return `Compendium.${doc.pack}.${doc.id}` || 
               `${doc.documentName}.${doc.id}`;
    }

    /**
     * System-specific compatibility shims
     */
    static createSystemShims() {
        return {
            // D&D 5e specific adjustments
            dnd5e: {
                itemUse: (item, config) => {
                    if (this.isV13) {
                        return item.use(config);
                    }
                    // v12 compatibility
                    return item.useItem(config);
                }
            },
            // General fallback
            default: {
                getFlag: (doc, scope, key) => {
                    if (this.isV13) {
                        return doc.getFlag(scope, key);
                    }
                    return doc.data.flags[scope]?.[key];
                }
            }
        };
    }
}

export const v13Shims = V13Compatibility.createSystemShims();

// Auto-initialize when imported
Hooks.once('init', () => V13Compatibility.init());