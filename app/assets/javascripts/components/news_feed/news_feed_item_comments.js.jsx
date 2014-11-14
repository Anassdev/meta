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
    // If there are a lot of NewsFeedItems, `addChangeListener()`
    // will throw a warning. It seems safe to ignore: it's a bug
    // in Node's EventEmitter implementation. :(
    NewsFeedItemStore.addChangeListener(this.getComments);
  },

  fetchCommentsFromServer: function(e) {
    e.stopPropagation();

    var url = this.state.url;

    $.get(url, function(response) {
      this.setState({
        comments: response,
        numberOfCommentsToShow: response.length
      });
    }.bind(this));
  },

  getComments: function(e) {
    var comments = NewsFeedItemStore.getComments(this.props.item.id);
    // debugger;
    this.setState({
      comment: '',
      comments: this.state.comments.concat(comments.confirmed),
      numberOfComments: this.state.numberOfComments + comments.confirmed.length,
      // This is pretty hacky (chrislloyd)
      numberOfCommentsToShow: (comments.optimistic.length ?
          this.state.numberOfCommentsToShow :
          this.state.numberOfCommentsToShow + 1),
      optimisticComments: comments.optimistic,
    });
  },

  getInitialState: function() {
    var item = this.props.item;

    return {
      comments: item.last_comment ? [item.last_comment] : [],
      numberOfComments: this.props.item.target.comments_count,
      numberOfCommentsToShow: 1,
      optimisticComments: [],
      url: item.url + '/comments'
    };
  },

  render: function() {
    var url = this.state.url;

    return (
      <div>
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
    var numberOfCommentsToShow = this.state.numberOfCommentsToShow;

    if (numberOfComments >= numberOfCommentsToShow) {
      return (
        <div>
          {this.renderLoadMoreButton(numberOfComments)}
          {_.last(confirmedComments, numberOfCommentsToShow)}
          {optimisticComments}
        </div>
      );
    }
  },

  renderConfirmedComments: function() {
    return this.state.comments.map(function(comment) {
      return (
        <div className="px3 py2" key={comment.id}>
          <Comment author={comment.user} body={comment.markdown_body} />
        </div>
      )
    })
  },

  renderLoadMoreButton: function(numberOfComments) {
    if (numberOfComments !== this.state.numberOfCommentsToShow) {
      return (
        <a className="block h6 blue clearfix mt0 mb0 px3 py2" href="javascript:void(0);" onClick={this.fetchCommentsFromServer}>
          &nbsp;View all {numberOfComments} comments
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

  showMoreComments: function(total) {
    return function(e) {
      this.setState({
        numberOfCommentsToShow: total
      });
    }.bind(this);
  }
})

window.NewsFeedItemComments = module.exports
