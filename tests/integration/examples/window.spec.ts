/// <reference types="cypress" />

import {
  createWindow,
  currentOpenedWindows,
  getObjectKeys,
} from "../../support/helpers";

const href = 'http://localhost:8888/tests/fixtures/';

context('createWindow', () => {
  beforeEach(() => {
    cy.visit(href + 'index.html');
  });

  it('should not have opened windows without calling createWindow', async () => {
    cy.window().then((win) => {
      expect(getObjectKeys(currentOpenedWindows(win))).to.be.empty;
    });
  });

  it('should allow an iframe to be created', async () => {
    createWindow(href + 'child.html').then((data) => {
      const {win, } = data;
      expect(getObjectKeys(currentOpenedWindows(win))).to.have.lengthOf(1);
    });
  });

  it('should allow a popup to be created', async () => {
    createWindow(href + 'child.html', { isPopup: true }).then((data) => {
      const {win, } = data;
      expect(getObjectKeys(currentOpenedWindows(win))).to.have.lengthOf(1);
    });
  });
});
