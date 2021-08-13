/// <reference types="cypress" />

const href = 'http://localhost:8888/tests/fixtures/';
const currentOpenedWindows = (win: any) => win.getAllOpenedWindows();

context('Window', () => {
  beforeEach(() => {
    cy.visit(href + 'index.html');
  });

  it('should not have opened windows without calling library', async () => {
    cy.window().then((win: any) => {
      expect(Object.keys(win.getAllOpenedWindows())).to.be.empty;
    });
  });

  it('should allow an iframe to be created', async () => {
    cy.window().then((win: any) => {
      const iframe = win.createWindow(href + 'child.html');

      // iframes need to be appended to the DOM in order to load
      iframe.appendTo(win.document.body);

      // make assertions once the iframe is loaded
      iframe.onload(() => {
        expect(Object(currentOpenedWindows(win)).keys()).to.have.lengthOf(1);
      });
    });
  });
});
