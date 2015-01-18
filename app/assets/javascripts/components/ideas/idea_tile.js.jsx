var Avatar = require('../ui/avatar.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Footer = require('../ui/footer.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var Love = require('../love.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var Share = require('../ui/share.js.jsx');
var SmallTile = require('../ui/small_tile.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var UserStore = require('../../stores/user_store');

var TILTING_THRESHOLD = 80;

var Idea = React.createClass({
  displayName: 'Idea',

  propTypes: {
    idea: React.PropTypes.shape({
      comments_count: React.PropTypes.number.isRequired,
      name: React.PropTypes.string.isRequired,
      news_feed_item: React.PropTypes.shape({
        id: React.PropTypes.string.isRequired
      }),
      short_body: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      user: React.PropTypes.object.isRequired
    }).isRequired
  },

  getInitialState() {
    return {
      currentUserId: UserStore.getId(),
      isDrawerOpen: false
    };
  },

  handleShareClick(e) {
    this.setState({
      isDrawerOpen: !this.state.isDrawerOpen
    });
  },

  render() {
    var idea = this.props.idea;
    var item = idea.news_feed_item;
    var user = idea.user;

    return (
      <div className="item">
        <SmallTile>
          <div className="main">
            <a href={idea.url}>
              <div className="xh4">
                {idea.name}
              </div>

              <div className="content">
                <p dangerouslySetInnerHTML={{ __html: idea.short_body }} />
              </div>
            </a>
          </div>

          <Footer>
            <div className="action-bar">
              <div className="item">
                <div className="details-group">
                  <a href={user.url} className="inline-block">
                    <Avatar user={user} />
                    <span>{this.renderUsername()}</span>
                  </a>
                </div>
              </div>

              <div className="mxn3">
                <Drawer open={this.state.isDrawerOpen}>
                  <IdeaSharePanel idea={idea} />
                </Drawer>
              </div>

              <div className="item">
                <div className="action-group">
                  <div className="item">
                    <a href={idea.url} className="comment-count">
                      <SvgIcon type="comment" />
                      {idea.comments_count} {idea.comments_count === 1 ? 'Comment' : 'Comments'}
                    </a>
                  </div>

                  <div className="item">
                    <a href="javascript:void(0);" onClick={this.handleShareClick}>
                      <SvgIcon type="share" />
                    </a>
                  </div>

                  <div className="item">
                    <Love heartable_id={item.id} heartable_type="NewsFeedItem" />
                  </div>
                </div>
              </div>

              <div className="item">
                <div className="py3 px3">
                  <ProgressBar progress={idea.temperature}
                      threshold={TILTING_THRESHOLD}
                      type="success" />
                </div>
              </div>
            </div>
          </Footer>
        </SmallTile>
      </div>
    );
  },

  renderUsername() {
    var user = this.props.idea.user;

    if (this.state.currentUserId === user.id) {
      return 'you';
    }

    return user.username;
  }
});

module.exports = Idea;
