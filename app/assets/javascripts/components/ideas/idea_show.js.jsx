var Avatar = require('../ui/avatar.js.jsx');
var Button = require('../ui/button.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Heart = require('../heart.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var Idea = require('../idea.js.jsx')
var RelatedIdeas = require('./related_ideas.js.jsx');
var IdeaLovers = require('./idea_lovers.js.jsx');
var IdeaProgressBar = require('./idea_progress_bar.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var IdeaStore = require('../../stores/idea_store');
var IdeaTile = require('./idea_tile.js.jsx');
var IdeaSharePanelStore = require('../../stores/idea_share_panel_store');
var Discussion = require('../ui/discussion.js.jsx')
var Markdown = require('../markdown.js.jsx');
var moment = require('moment');
var NewCommentActionCreators = require('../../actions/new_comment_action_creators');
var NewsFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var UserStore = require('../../stores/user_store');
var LoveStore = require('../../stores/love_store');
var TextPost = require('../ui/text_post.js.jsx')
var Tile = require('../ui/tile.js.jsx')

var TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

function twitterUrl(url, message) {
  return 'http://twitter.com/share?url=' +
    url +
    '&text=' +
    message +
    '&';
}


var IdeaShow = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    window.scrollTo(0, 0);

    if (this.state.idea) {
      document.title = this.state.idea.name;
    }

    IdeaStore.addChangeListener(this.onIdeaChange)
    LoveStore.addChangeListener(this.onLoveChange)
    IdeaSharePanelStore.addChangeListener(this.onIdeaSharePanelChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange)
    LoveStore.removeChangeListener(this.onLoveChange)
    IdeaSharePanelStore.removeChangeListener(this.onIdeaSharePanelChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      isSocialDrawerOpen: false,
      isHowItWorksDrawerOpen: false,
      heart: {}
    };
  },

  handlePingClick(e) {
    e.stopPropagation();

    var idea = this.state.idea;
    var item = idea.news_feed_item;
    var thread = item.id;
    var text = 'Hey @' + idea.user.username + ', how can I help you build this?';

    NewCommentActionCreators.updateComment(thread, text);

    var $commentBox = $('#event_comment_body');

    $('html, body').animate({
      scrollTop: $commentBox.offset().top
    }, 'fast');

    $commentBox.focus();
  },

  handleShareClick() {
    this.setState({
      isSocialDrawerOpen: !this.state.isSocialDrawerOpen
    });
  },

  onIdeaChange() {
    this.setState({
      idea: IdeaStore.getIdea()
    });
  },

  onLoveChange: function() {
    if (!_.isNull(this.state.idea)) {
      this.setState({
        heart: (LoveStore.get(this.state.idea.news_feed_item.id) || {})
      })
    }
  },

  onRelatedIdeasChange() {
    this.setState({
      relatedIdeas: RelatedIdeaStore.getRelatedIdeas()
    });
  },

  render() {
    var idea = this.state.idea

    if (_.isEmpty(idea)) {
      return null;
    }

    var nfi = idea.news_feed_item

    var navigate = this.props.navigate;

    return (
      <div>

        <div className="subnav bg-white py3 md-show lg-show">
          <div className="container clearfix">
            <div className="left">
              <h4 className="mt2 mb2">
                Band together to build the product ideas people love.
              </h4>
            </div>
            <div className="right py1">
              <Button type="primary" action={navigate.bind(null, '/ideas/new')}>
                Add your product idea
              </Button>
            </div>
          </div>
        </div>

        <div className="container">

          <div className="py3">
            <a href="/ideas" className="h6 bold gray-2">
              <Icon icon="chevron-left" /> All ideas
            </a>
          </div>

          <div className="clearfix mxn2">
            <div className="col col-8 px2">
              <Discussion newsFeedItem={idea.news_feed_item}>
                <Idea idea={idea} />
              </Discussion>
            </div>

            <div className="col col-4 px2">

              <div className="mb3">
                <Tile>
                  <div className="p3">
                    <div className="clearfix mb3">
                      <div className="left center mr3">
                        <div className="h1 yellow center">
                          <Icon icon="lightbulb-o" />
                        </div>
                        <div className="h3 bold">
                          #{idea.rank}
                        </div>
                      </div>
                      <p className="overflow-hidden gray-2 mb0">
                        This idea is on it’s way to being fast-tracked. Every Wednesday the most loved idea is selected to become a product and is built out by the community.
                      </p>
                    </div>

                    <Heart size="button" heartable_id={nfi.id} heartable_type={nfi.heartable_type} />
                  </div>

                  <Drawer open={this.state.heart.user_heart}>
                    <div className="p3 bg-gray-6 border-top border-gray-5">
                      <div className="h6 center gray-2">
                        Spread this idea to help it become reality
                      </div>

                      <ul className="h3 list-reset clearfix mxn1 mb0">
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold" href="#" onClick={this.handleTwitterClick}>
                            <Icon icon="twitter" />
                          </a>
                        </li>
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold" href="#" onClick={this.handleFacebookClick}><Icon icon="facebook" /></a>
                        </li>
                        <li className="left p1">
                          <a className="gray-3 gray-2-hover bold" href={this.mailToLink()}>
                            <Icon icon="envelope" />
                          </a>
                        </li>
                      </ul>

                    </div>
                  </Drawer>

                </Tile>
              </div>

              <h6 className="mt3 mb3 gray-2">Related ideas</h6>

              <RelatedIdeas />
            </div>
          </div>
        </div>

      </div>
    );
  },

  // Stuff for the share thingy

  handleTwitterClick(e) {
    e.preventDefault()

    window.open(
      twitterUrl(this.shareUrl(), this.state.idea.name),
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    )
  },

  handleFacebookClick(e) {
    e.preventDefault()

    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.shareUrl(),
    })
  },

  shareUrl() {
    return this.state.idea.url
  },

  mailToLink() {
    return "mailto:?subject=Check this out&body=Check out this on Assembly: " + this.shareUrl()
  }



});

module.exports = IdeaShow;
