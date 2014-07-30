/** @jsx React.DOM */

//= require constants
//= require stores/dropdown_news_feed_store

(function() {
  var _stores = {
    DROPDOWN_NEWS_FEED: DropdownNewsFeedStore,
    NOTIFICATIONS: NotificationsStore
  };

  window.DropdownToggler = React.createClass({
    getDefaultProps: function() {
      return {
        title: document.title
      };
    },

    acknowledge: function() {
      var timestamp = Math.floor(Date.now() / 1000);

      localStorage.notificationsAck = timestamp;

      this.setState({
        acknowledgedAt: timestamp
      });

      this.resetTitle();
    },

    resetTitle: function() {
      document.title = this.props.title;
    },

    badgeCount: function() {
      if (this.props.store === 'DROPDOWN_NEWS_FEED') {
        var self = this;
        var unreadStories = this.state.stories &&
          _.filter(
            this.state.stories,
            function(story) {
              return story.readAt == null;
            }
          );

        return unreadStories && unreadStories.length;
      }

      if (this.latestStoryTimestamp() > this.state.acknowledgedAt) {
        return this.total();
      }
    },

    componentWillMount: function() {
      var store = this.props.store;

      // One server call (in the main component) and no duplicated data (stories
      // are passed by reference)
      _stores[store] && _stores[store].addChangeListener(
        CONSTANTS[store].EVENTS[this.props.event],
        this.getStories
      );
    },

    getInitialState: function() {
      return {
        stories: null,
        acknowledgedAt: this.storedAck()
      };
    },

    getStories: function() {
      this.setState({
        stories: _stores[this.props.store].getStories()
      });
    },

    latestStory: function() {
      var stories = this.state.stories;

      if (!stories) {
        return;
      }

      var story;
      for (var i = 0, l = stories.length; i < l; i++) {
        if (story && stories[i].updated > story.updated) {
          story = stories[i];
        }

        if (!story) {
          story = stories[i];
        }
      }

      return story;
    },

    latestStoryTimestamp: function() {
      var story = this.latestStory();

      return story && story.updated ? story.updated : 0;
    },

    render: function() {
      var classes = ['icon', 'navbar-icon', this.props.iconClass];
      var total = this.badgeCount();
      var badge = null;

      if (total > 0) {
        badge = this.props.iconClass.indexOf('bubble') > -1 ?
          <span className='indicator indicator-danger' style={{ position: 'relative', top: '5px' }} /> :
          <span className='badge badge-notification'>{total}</span>;
        classes.push('glyphicon-highlight');
      }

      return (
        <a href={this.props.href} data-toggle='dropdown' onClick={this.acknowledge}>
          <span className={classes.join(' ')}></span>
          {badge}
          <span className='visible-xs-inline' style={{ 'margin-left': '5px' }}>
            {this.props.label}
          </span>
        </a>
      );
    },

    storedAck: function() {
      var timestamp = localStorage.newsFeedAck;

      if (timestamp == null || timestamp === 'null') {
        return -1;
      } else {
        return parseInt(timestamp, 10);
      }
    },

    total: function() {
      var self = this;

      var count = _.reduce(
        _.map(self.state.stories, function mapStories(story) {
          return story.entities && story.entities.length;
        }), function reduceStories(memo, read) {
          return memo + read;
      }, 0);

      return count;
    }
  });
})();
