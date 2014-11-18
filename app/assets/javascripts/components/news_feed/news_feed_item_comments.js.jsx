/** @jsx React.DOM */

// TODO This lib is in application.js (chrislloyd)
// var marked = require('marked')

var CONSTANTS = require('../../constants').NEWS_FEED_ITEM;
var Comment = require('../comment.js.jsx')
var Dispatcher = require('../../dispatcher.js');
var NewComment = require('./new_comment.js.jsx');
var NewsFeedItemStore = require('../../stores/news_feed_item_store');


module.exports = React.createClass({
  displayName: 'NewsFeedItemComments',

  propTypes: {
    item: React.PropTypes.object.isRequired
  },

  componentWillMount: function() {
    NewsFeedItemStore.addChangeListener(this.getComments);
  },

  fetchCommentsFromServer: function(e) {
    e.stopPropagation();

    var url = this.state.url;

    $.get(url, function(response) {
      this.setState({
        comments: response,
        showCommentsAfter: 0
      });
    }.bind(this));
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

  getInitialState: function() {
    var item = this.props.item;
    var lastComment = item.last_comment;

    return {
      comments: lastComment ? [lastComment] : [],
      numberOfComments: item.target.comments_count || item.comments_count,
      optimisticComments: [],
      showCommentsAfter: lastComment ? +new Date(lastComment.created_at) : +Date.now(),
      url: item.url + '/comments'
    };
  },

  render: function() {
    var url = this.state.url;

    return (
      <div key={this.props.item.id}>
        {this.renderComments()}
        <div className="border-top px3 py2">
          <NewComment url={url} thread={this.props.item.id} />
        </div>
      </div>
    );
  },

  renderComments: function() {
    var confirmedComments = this.renderConfirmedComments();
    var optimisticComments = this.renderOptimisticComments();
    var comments = confirmedComments.concat(optimisticComments);
    var numberOfComments = this.state.numberOfComments;

    return (
      <div>
        {this.renderLoadMoreButton(numberOfComments)}
        {confirmedComments}
        {optimisticComments}
      </div>
    );
  },

  renderConfirmedComments: function() {
    var renderIfAfter = this.state.showCommentsAfter;

    return this.state.comments.map(function(comment) {
      if (new Date(comment.created_at) >= renderIfAfter) {
        return (
          <div className="px3 py2" key={comment.id}>
            <Comment author={comment.user} body={comment.markdown_body} />
          </div>
        );
      }
    });
  },

  renderLoadMoreButton: function(numberOfComments) {
    if (numberOfComments > this.state.comments.length) {
      return (
        <a className="block h6 blue clearfix mt0 mb0 px3 py2" href="javascript:void(0);" onClick={this.fetchCommentsFromServer}>
          {' '} View all {numberOfComments} comments
        </a>
      );
    }
  },

  renderOptimisticComments: function() {
    return this.state.optimisticComments.map(function(comment) {
      return (
        <div className="px3 py2" key={comment.id}>
          <Comment author={comment.user} body={marked(comment.body)} optimistic={true} />
        </div>
      )
    });
  },

  showMoreComments: function() {
    return function(e) {
      this.setState({
        showCommentsAfter: 0
      });
    }.bind(this);
  }
})

window.NewsFeedItemComments = module.exports
