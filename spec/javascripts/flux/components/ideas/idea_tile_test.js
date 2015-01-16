jest.dontMock(appFile('components/ideas/idea_tile.js.jsx'));

describe('IdeaTile', function() {
  global.Dispatcher = require(appFile('dispatcher'));
  var idea = {
    body: 'idea',
    comments_count: 2,
    name: 'test-idea',
    news_feed_item: {
      id: 'nfi1'
    },
    short_body: 'shorty shorty shorty',
    temperature: 90,
    user: {
      avatar_url: 'http://imgur.com/avatar.jpg',
      username: 'hover_boots'
    }
  };

  it('renders a small tile with an idea', function() {
    var IdeaTile = require(appFile('components/ideas/idea_tile.js.jsx'));
    var ideaTile = TestUtils.renderIntoDocument(
      <IdeaTile idea={idea} />
    );

    var progress = TestUtils.findRenderedComponentWithType(
      ideaTile,
      require.requireActual(appFile('components/ui/progress_bar.js.jsx'))
    );

    expect(progress).toBeDefined();
    expect(progress.props.progress).toEqual(idea.temperature);
  });
});
