var Markdown = require('../markdown.js.jsx');
var NewsFeedItemModalMixin = require('../../mixins/news_feed_item_modal_mixin');

module.exports = React.createClass({
  displayName: 'NewsFeedItemPost',

  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired,
    url: React.PropTypes.string.isRequired
  },

  mixins: [NewsFeedItemModalMixin],

  render: function() {
    var target = this.props.target;

    return (
      <a className="block mt0 mb3" href={this.props.url} onClick={this.handleClick}>
        <div className="p3">
          <div className="h3 mt0 mb1">{this.props.title}</div>
          {this.renderSummary()}

          <div className="mt3 gray-darker" style={{ fontSize: 16 }}>
            <Markdown content={this.props.body} normalized={true} />
          </div>
        </div>
      </a>
    );
  },

  renderSummary: function() {
    if (this.props.target && this.props.target.summary) {
      return (
        <div className="gray">
          <Markdown content={this.props.target.summary} normalized={true} />
        </div>
      );
    }
  }
});
