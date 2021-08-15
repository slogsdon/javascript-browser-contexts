/// <reference types="cypress" />

import {
  currentBrowserContexts,
  getObjectKeys,
} from "../../support/helpers";
import { createWindow } from '../../../lib';

const href = 'http://localhost:8888/tests/fixtures/';

context('createWindow', () => {
  beforeEach(() => {
    cy.visit(href + 'index.html');
  });

  it('should not have opened windows without calling createWindow', async () => {
    cy.window().then(() => {
      expect(getObjectKeys(currentBrowserContexts())).to.be.empty;
    });
  });

  it('should allow an iframe to be created', () => {
    let browserContexts = {};
    let createdWindow;

    // setup
    cy.window().then((win) => {
      createdWindow = createWindow(href + 'child.html');

      // iframes need to be appended to the DOM in order to load
      createdWindow.appendTo(win.document.body);

      // allow assertions once the window is loaded
      createdWindow.onload(() =>{
        browserContexts = currentBrowserContexts();
        console.log(createdWindow);
      });
    });

    // assert
    cy.window()
      .should(() => {
        expect(browserContexts).to.be.an('object')
      })
      .then(() => getObjectKeys(currentBrowserContexts()))
      .should('have.length', 1);

    // cleanup
    cy.window()
      .should(() => {
        expect(createdWindow).to.be.an('object');
      })
      .then(() => {
        createdWindow.close();
        return getObjectKeys(currentBrowserContexts());
      })
      .should('have.length', 0);
  });

  // it('should allow a popup to be created', () => {
  //   let browserContexts = {};
  //   let createdWindow;

  //   // setup
  //   cy.window().then((win) => {
  //     (win as any).Popup = createdWindow = createWindow(href + 'child.html', { id: "Popup", isPopup: true });

  //     // allow assertions once the window is loaded
  //     createdWindow.onload(() =>{
  //       browserContexts = currentBrowserContexts();
  //       console.log(createdWindow);
  //     });
  //   });

  //   // assert
  //   cy.window()
  //     .should(() => {
  //       expect(browserContexts).to.be.an('object')
  //     })
  //     .then(() => getObjectKeys(currentBrowserContexts()))
  //     .should('have.length', 1);

  //   // cleanup
  //   cy.window()
  //     .should(() => {
  //       expect(createdWindow).to.be.an('object');
  //     })
  //     .then((win) => {
  //       (win as any).Popup.close()
  //       createdWindow.close();
  //     });
  //   cy.window()
  //     .should(() => {
  //       expect(createdWindow.root.closed).to.be.true;
  //     })
  //     .then(() => getObjectKeys(currentBrowserContexts()))
  //     .should('have.length', 0);
  // });
});
