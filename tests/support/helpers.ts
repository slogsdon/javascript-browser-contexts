/// <reference types="cypress" />
import { IKnownWindows, BrowserContext } from '../../lib/browser-context';

export interface CreateWindowHelperResult {
  createdWindow: BrowserContext;
  win: Cypress.AUTWindow;
}

export function getObjectKeys(obj: Record<string, unknown>): string[] {
  const result = [];
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) result.push(k);
  }
  return result;
}

export function currentBrowserContexts(): IKnownWindows {
  return BrowserContext.all() || {};
}
