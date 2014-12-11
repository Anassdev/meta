// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var CONSTANTS = window.CONSTANTS.NEWS_FEED_ITEM;
var BountyStore = require('../../stores/bounty_store');
var Comment = require('../comment.js.jsx');
var Dispatcher = window.Dispatcher;
var Icon = require('../icon.js.jsx');
var NewComment = require('./new_comment.js.jsx');
var NewsFeedItemBountyClose = require('./news_feed_item_bounty_close.js.jsx');
var NewsFeedItemBountyCommentReference = require('./news_feed_item_bounty_comment_reference.js.jsx');
var NewsFeedItemBountyReviewReady = require('./news_feed_item_bounty_review_ready.js.jsx');
var NewsFeedItemBountyTagChange = require('./news_feed_item_bounty_tag_change.js.jsx');
var NewsFeedItemBountyTimelineItem = require('./news_feed_item_bounty_timeline_item.js.jsx');
var NewsFeedItemBountyTitleChange = require('./news_feed_item_bounty_title_change.js.jsx');
var NewsFeedItemBountyWin = require('./news_feed_item_bounty_win.js.jsx');
var NewsFeedItemStore = require('../../stores/news_feed_item_store');
var UserStore = require('../../stores/user_store');

var NewsFeedItemComments = React.createClass({
  displayName: 'NewsFeedItemComments',

  propTypes: {
    commentable: React.PropTypes.bool,
    item: React.PropTypes.object.isRequired,
    showAllComments: React.PropTypes.bool
  },

  componentDidMount: function() {
    if (this.props.showAllComments) {
      this.fetchCommentsFromServer({ stopPropagation: function() {} });
    }
  },

  componentWillMount: function() {
    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.addChangeListener(this.getBountyState);
    }

    NewsFeedItemStore.addChangeListener(this.getComments);
  },

  componentWillUnmount: function() {
    if (_reach(this.props, 'item.target.type') === 'task') {
      BountyStore.removeChangeListener(this.getBountyState);
    }

    NewsFeedItemStore.removeChangeListener(this.getComments);
  },

  fetchCommentsFromServer: function(e) {
    e.stopPropagation();

    var url = this.state.url;

    $.get(url, function(response) {
      this.setState({
        comments: response.comments,
        events: response.events,
        showCommentsAfter: 0
      });
    }.bind(this));
  },

  getBountyState: function() {
    var state = BountyStore.getState();

    if (state === 'reviewing') {
      var comments = this.state.comments;

      comments.push(this.renderOptimisticReviewReady());

      this.setState({
        comments: comments
      });
    }
  },

  getComments: function(e) {
    var comments = NewsFeedItemStore.getComments(this.props.item.id);

    this.setState({
      comment: '',
      comments: this.state.comments.concat(comments.confirmed),
      numberOfComments: this.state.numberOfComments + comments.confirmed.length,
      optimisticComments: comments.optimistic
    });
  },

  getDefaultProps: function() {
    return {
      commentable: false
    };
  },

  getInitialState: function() {
    var item = this.props.item;
    var showAllComments = this.props.showAllComments;
    var lastComment = item.last_comment;

    var showCommentsAfter;
    if (!showAllComments) {
      showCommentsAfter = +(lastComment ? new Date(lastComment.created_at) : Date.now());
    } else {
      showCommentsAfter = 0;
    }

    return {
      comments: lastComment ? [lastComment] : [],
      events: [],
      numberOfComments: item.comments_count,
      optimisticComments: [],
      showCommentsAfter: showCommentsAfter,
      url: item.url + '/comments'
    };
  },

  render: function() {
    return (
      <div className="px3">
        {this.renderComments()}
        {this.renderNewCommentForm()}
      </div>
    );
  },

  renderComments: function() {
    var confirmedComments = this.renderConfirmedComments();
    var optimisticComments = this.renderOptimisticComments();
    var comments = confirmedComments.concat(optimisticComments);

    if (!comments.length) {
      return;
    }

    return (
      <div>
        {this.renderLoadMoreButton()}
        <div className="timeline">
          {confirmedComments}
          {optimisticComments}
        </div>
      </div>
    );
  },

  renderConfirmedComments: function() {
    var renderIfAfter = this.state.showCommentsAfter;
    var comments = this.state.comments.concat(this.state.events).sort(_sort);

    return comments.map(function(comment) {
      if (new Date(comment.created_at) >= renderIfAfter) {
        return (
          parseEvent(comment)
        );
      }
    });
  },

  renderLoadMoreButton: function() {
    var numberOfComments = this.state.numberOfComments;
    var target = this.props.item.target;

    if (numberOfComments > this.state.comments.length) {
      return (
        <a className="block text-small mt2 gray-dark clickable"
            onClick={this.triggerModal}
            style={{textDecoration: 'underline'}}>
          <span className="mr1">
            <Icon icon="comment" />
          </span>
          View all {numberOfComments} comments
        </a>
      );
    }
  },

  renderNewCommentForm: function() {
    var item = this.props.item;

    if (this.props.commentable) {
      var url = this.state.url;

      if (window.app.currentUser()) {
        return <NewComment
            {...this.props}
            canContainWork={item.target && item.target.type === 'task'}
            url={url}
            thread={item.id}
            user={window.app.currentUser()} />
      }
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="py3" key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} />
        </div>
      )
    });
  },

  renderOptimisticReviewReady: function() {
    var user = UserStore.get();

    // when we get the event back in the confirmation, set the award_url
    // so that the buttons show up
    if (user.isCore) {
      return {
        type: 'Event::ReviewReady',
        actor: user,
        // award_url: this.props.url + '/award',
        created_at: new Date(),
        id: 'FIXME'
      };
    }
  },

  triggerModal: function(e) {
    e.stopPropagation();

    this.props.triggerModal();
  }
});

if (typeof module !== 'undefined') {
  module.exports = NewsFeedItemComments;
}

window.NewsFeedItemComments = module.exports;

function parseEvent(event) {
  var renderedEvent;

  switch(event.type) {
  case 'Event::Allocation':
    renderedEvent = null;
    break;
  case 'Event::Close':
    renderedEvent = <NewsFeedItemBountyClose {...event} />;
    break;
  case 'Event::CommentReference':
    renderedEvent = <NewsFeedItemBountyCommentReference {...event} />;
    break;
  case 'Event::ReviewReady':
    renderedEvent = <NewsFeedItemBountyReviewReady {...event} />;
    break;
  case 'Event::Win':
    renderedEvent = <NewsFeedItemBountyWin {...event} />;
    break;
  case 'Event::TagChange':
    // don't render tag change events
    // renderedEvent = <NewsFeedItemBountyTagChange {...event} />;
    // See TODO in NewsFeedItemBountyTagChange
    break;
  case 'Event::TitleChange':
    renderedEvent = <NewsFeedItemBountyTitleChange {...event} />;
    break;
  case 'news_feed_item_comment':
    renderedEvent = <Comment author={event.user} body={event.markdown_body} timestamp={event.created_at} />;
    break;
  default:
    renderedEvent = <NewsFeedItemBountyTimelineItem {...event} />;
    break;
  }

  if (renderedEvent) {
    return (
      <div className="py2" key={event.id}>
        {renderedEvent}
      </div>
    );
  }
}

function _reach(obj, prop) {
  var props = prop.split('.');

  while (props.length) {
    var p = props.shift();

    if (obj && obj.hasOwnProperty(p)) {
      obj = obj[p]
    } else {
      obj = undefined;
      break;
    }
  }

  return obj;
}

function _sort(a, b) {
  var aDate = +new Date(a.created_at);
  var bDate = +new Date(b.created_at);

  return aDate > bDate ? 1 : bDate > aDate ? -1 : 0;
}
