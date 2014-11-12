/** @jsx React.DOM */

jest.dontMock('outlayer');

describe('NewsFeed', function() {
  var NewsFeed = require.requireActual(
    path.resolve(
      __dirname,
      '../../../../../',
      'app/assets/javascripts/components/news_feed/news_feed.js.jsx'
    )
  );

  it('renders', function() {
    var newsFeed = TestUtils.renderIntoDocument(
      <NewsFeed />
    );

    var nf = TestUtils.findRenderedComponentWithType(
      newsFeed,
      NewsFeed
    );

    expect(nf).toBeDefined();
    expect(nf.state.page).toEqual(1);
  });
});
