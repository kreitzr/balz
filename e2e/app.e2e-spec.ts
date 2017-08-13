import { TemporaryPage } from './app.po';

describe('temporary App', () => {
  let page: TemporaryPage;

  beforeEach(() => {
    page = new TemporaryPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
