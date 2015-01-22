var Avatar = require('../ui/avatar.js.jsx');
var Button = require('../ui/button.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var IdeaContainer = require('./idea_container.js.jsx');
var IdeaLovers = require('./idea_lovers.js.jsx');
var IdeaProgressBar = require('./idea_progress_bar.js.jsx');
var IdeaSharePanel = require('./idea_share_panel.js.jsx');
var IdeaStore = require('../../stores/idea_store');
var IdeaTile = require('./idea_tile.js.jsx');
var Heart = require('../ui/heart.js.jsx');
var LoveStore = require('../../stores/love_store');
var Markdown = require('../markdown.js.jsx');
var moment = require('moment');
var NewCommentActionCreators = require('../../actions/new_comment_action_creators');
var NewsFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx');
var ProgressBar = require('../ui/progress_bar.js.jsx');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var UserStore = require('../../stores/user_store');

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
    IdeaStore.addChangeListener(this.onIdeaChange);
    LoveStore.addChangeListener(this.onLoveChange);
  },

  componentWillUnmount() {
    IdeaStore.removeChangeListener(this.onIdeaChange);
    LoveStore.removeChangeListener(this.onLoveChange);
  },

  getInitialState() {
    return {
      idea: IdeaStore.getIdea(),
      isSocialDrawerOpen: false,
      isHowItWorksDrawerOpen: false
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

  onLoveChange() {
    var idea = this.state.idea;
    var item = idea && idea.news_feed_item;
    var heartableId = item && item.id;

    if (heartableId) {
      var heartable = LoveStore.get(heartableId);

      this.setState({
        isSocialDrawerOpen: heartable && !!heartable.user_heart
      });
    }
  },

  onRelatedIdeasChange() {
    this.setState({
      relatedIdeas: RelatedIdeaStore.getRelatedIdeas()
    });
  },

  onQuestionMarkClick(e) {
    this.setState({
      isHowItWorksDrawerOpen: !this.state.isHowItWorksDrawerOpen
    });
  },

  render() {
    var idea = this.state.idea;

    if (_.isEmpty(idea)) {
      return null;
    }

    var navigate = this.props.navigate;
    var shareMessage = 'We need help with ' + idea.name + '! via @asm';

    return (
      <main role="main">
        <div className="subnav bg-white py3 px4 md-show lg-show">
          <div className="clearfix">
            <div className="px4 left">
              <h4 className="mt2 mb2">
                Band together to build the app ideas people love.
              </h4>
            </div>
            <div className="px4 right py1">
              <Button type="primary" action={navigate.bind(null, '/ideas/new')}>
                Add your app idea
              </Button>
            </div>
          </div>
        </div>

        <IdeaContainer navigate={navigate}>
          {this.renderHeader()}

          <div className="mxn3">
            <Drawer open={this.state.isSocialDrawerOpen} height={150}>
              <IdeaSharePanel idea={idea} size="large" message={shareMessage} />
            </Drawer>
          </div>

          {this.renderBody()}
        </IdeaContainer>
      </main>
    );
  },

  renderAdminRow() {
    var currentUser = UserStore.getUser();

    if (currentUser && currentUser.is_staff) {
      var idea = this.state.idea;

      return (
        <div className="border-2px clearfix">
          <div className="py2 px4 right">
            <a href={idea.url + '/admin'}>Admin</a>
          </div>
        </div>
      )
    }
  },

  renderBody() {
    var idea = this.state.idea;
    var user = idea.user;

    return (
      <div className="border-2px" style={{ paddingBottom: '1rem' }}>
        <div className="py3 px4">
          <h1 className="mt0 mb0">{idea.name}</h1>

          <div className="mt3">
            <Markdown content={idea.body} normalized={true} />
          </div>

          <div className="clearfix mt3">
            <span className="left mr1"><Avatar user={user} /></span>
            <span className="bold">{user.username}</span>{' '}
            <span className="gray-2">posted {moment(idea.created_at).fromNow()}</span>
          </div>
        </div>

        <hr className="py0 mb0" style={{ borderBottomColor: '#ededed', borderWidth: 2 }} />

        <div id="comments" className="px4">
          <NewsFeedItemComments commentable={true}
              dropzoneInnerText={false}
              item={idea.news_feed_item}
              showAllComments={true}
              showQuestionButtons={true} />
        </div>
      </div>
    );
  },

  renderCreateProductRow() {
    var idea = this.state.idea;
    var ideaUser = idea.user;
    var greenlit = idea.hearts_count >= idea.tilting_threshold || idea.greenlit_at;

    if (greenlit) {
      if (ideaUser.id === UserStore.getId()) {
        return (
          <div className="clearfix border-bottom border-top border-2px py2">
            <div className="left mt1 px4">
              <span className="gray-1">
                This app idea has been greenlit!
              </span>
            </div>

            <div className="right mr2">
              <a href={"/new?pitch=" + idea.raw_body}>
                <Button type="primary" action={function() {}}>
                  <span className="text-white bold">
                    Start building
                  </span>
                </Button>
              </a>
            </div>
          </div>
        );
      } else {
        return (
          <div className="clearfix border-bottom border-top border-2px py2">
            <div className="left mt1 ml4">
              <span className="gray-1">
                We're waiting for {' '}
                <a href={ideaUser.url} className="black bold">
                  @{ideaUser.username}
                </a> to turn this idea into a product.
              </span>
            </div>

            <div className="right mr2">
              <Button type="primary" action={this.handlePingClick}>
                <span className="text-white bold">
                  Ping them
                </span>
              </Button>
            </div>
          </div>
        );
      }
    }
  },

  renderDiscoverBlocks() {
    return (
      <div className="clearfix mxn2 py2">
        <a href="#" className="block col col-6 px2">
          <div className="rounded text-white bg-gray-2 p3">
            <div className="clearfix">
              <div className="col col-8">
                <h6 className="caps mt0 mb0" style={{ fontWeight: 'normal' }}>Trending</h6>
                <span className="bold" style={{ fontSize: 18 }}>Design ideas</span>
              </div>
              <div className="col col-4">
                <span className="right mt0 mb0" style={{ fontSize: 36, fontWeight: 200 }}>112</span>
              </div>
            </div>
          </div>
        </a>

        <a href="#" className="block col col-6 px2">
          <div className="rounded text-white bg-gray-2 p3">
            <div className="clearfix">
              <div className="col col-8">
                <h6 className="caps mt0 mb0" style={{ fontWeight: 'normal' }}>Trending</h6>
                <span className="bold" style={{ fontSize: 18 }}>Mobile ideas</span>
              </div>
              <div className="col col-4">
                <span className="right mt0 mb0" style={{ fontSize: 36, fontWeight: 200 }}>112</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  },

  renderExplanationHeading() {
    var idea = this.state.idea;
    var heartsToGo = idea.tilting_threshold - idea.hearts_count;
    if (heartsToGo > 0) {
      return (
        <h5 className="mb1 mt0">
          This idea needs {heartsToGo} more
          {heartsToGo === 1 ? ' heart' : ' hearts'} to be greenlit for development.
        </h5>
      );
    }
  },

  renderHeader() {
    var idea = this.state.idea;

    return [
      this.renderAdminRow(),

      <div className="clearfix border-bottom border-2px" key="heart-and-idea">
        <div className="center col col-2 px2">
          <Heart
            size="large"
            heartable_id={idea.news_feed_item.id}
            heartable_type="NewsFeedItem" />
        </div>

        <div className="col col-10">
          <span className="right px4">
            {this.renderHeartsToGo()}
          </span>

          <small className="left gray-2 bold mt1 mb1">
            {idea.hearts_count} {idea.hearts_count === 1 ? 'heart' : 'hearts'}
          </small>

          <div className="clearfix mt3 mb1 py1 mr2">
            <div className="col col-11">
              <IdeaProgressBar idea={idea} />
            </div>
            <div className="col col-1 mb0 mt0 px2" style={{ color: '#fa7838', position: 'relative', top: '-5px' }}>
              <span className="clickable" onClick={this.onQuestionMarkClick}>
                <Icon icon="question-circle" />
              </span>
            </div>
          </div>
        </div>

        <div className="clearfix">
          <Drawer height={120} open={this.state.isHowItWorksDrawerOpen}>
            <div className="px3 gray-2">
              {this.renderExplanationHeading()}
              <p>
                Every day we green light the most loved ideas on Assembly.
                They are then made into real products by you and the community.
                Share this idea with your friends on Twitter of Facebook to help
                greenlight it.
              </p>
            </div>
          </Drawer>
        </div>
      </div>,

      <div className="clearfix border-bottom border-2px mb0" key="comments-and-share">
        <div className="left mt2 px4">
          <IdeaLovers heartableId={idea.news_feed_item.id} />
        </div>

        <div className="right clearfix">
          <div className="left mt2 mr3">
            <a href="#comments" className="comment-count">
              <SvgIcon type="comment" />
              {idea.comments_count} {idea.comments_count === 1 ? 'comment' : 'comments'}
            </a>
          </div>
          <div className="right p2 center border-2px border-left border-gray">
            <a href="javascript:void(0);" className="action-icon gray" onClick={this.handleShareClick}>
              <SvgIcon type="share" />
            </a>
          </div>
        </div>
      </div>,

      idea.product ? this.renderProductRow() : this.renderCreateProductRow()
    ];
  },

  renderHeartsToGo() {
    var idea = this.state.idea;
    var heartsToGo = idea.tilting_threshold - idea.hearts_count;
    if (heartsToGo > 0) {
      return (
        <small className="right gray-3 mt1 mb1 mr2">
          {heartsToGo} {heartsToGo === 1 ? 'heart' : 'hearts'} to go!
        </small>
      );
    }

    return (
      <small className="right green mt1 mb1 mr2">
        This idea has been greenlit!
      </small>
    );
  },

  renderProductRow() {
    var idea = this.state.idea;
    var product = idea.product;

    return (
      <div className="clearfix border-bottom border-top border-2px py2">
        <div className="left mt1 px4">
          <span className="gray-1">
            Sweet! <a href={product.url} className="black bold">{product.name}</a>{' '}
            is live!
          </span>
        </div>

        <div className="right mr2">
          <a href={product.url + '/bounties'}>
            <Button type="primary" action={function() {}}>
              <span className="text-white bold">
                Join the team
              </span>
            </Button>
          </a>
        </div>
      </div>
    );
  },

  renderSubscriptionForm() {
    return (
      <div className="card bg-white">
        <div className="clearfix overflow-hidden">
          <div className="py2 col col-1 center">
            <Icon icon="cloud" />
          </div>

          <div className="py2 col col-5">
            <span className="mt2">Get updates on each day's top-ranking product ideas</span>
          </div>

          <div className="py2 col col-5">
            <form className="form-inline">
              <div className="form-group">
                <input className="ml4 form-control input-sm left" ref="email" />
                <button className="btn-primary pill-button pill-button-theme-white pill-button-border pill-button-shadow left ml2">
                  <span className="py2">Join</span>
                </button>
              </div>
            </form>
          </div>

          <div className="py2 col col-1 border-left border-2px center">
            <span>&times;</span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeaShow;
