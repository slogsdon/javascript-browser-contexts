/// <reference types="cypress" />
import { IKnownWindows, BrowserContext } from '../../src/browser-context';
import { WindowOptions } from '../../src/types';

export type FixtureWindow = Cypress.AUTWindow & {
  createWindow: (src: string, options?: WindowOptions) => BrowserContext;
  getAllBrowserContexts: () => IKnownWindows;
}

export interface CreateWindowHelperResult {
  createdWindow: BrowserContext;
  win: FixtureWindow;
}

export function getObjectKeys(obj: Record<string, unknown>): string[] {
  const result = [];
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) result.push(k);
  }
  return result;
}

export function currentBrowserContexts(win: Cypress.AUTWindow | FixtureWindow): IKnownWindows {
  return (win as FixtureWindow).getAllBrowserContexts() || {};
}

export function createWindow(src: string, options?: WindowOptions): Promise<CreateWindowHelperResult> {
  return new Promise((resolve) => {
    cy.window().then((win: Cypress.AUTWindow) => {
      const createdWindow = (win as FixtureWindow).createWindow(src);

      if (!options || !options.isPopup) {
        // iframes need to be appended to the DOM in order to load
        createdWindow.appendTo(win.document.body);
      }

      // allow assertions once the window is loaded
      createdWindow.onload(() => {
        resolve({
          createdWindow,
          win: (win as FixtureWindow),
        });
      });
    });
  });
}