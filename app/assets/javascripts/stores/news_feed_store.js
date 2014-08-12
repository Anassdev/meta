var xhr = require('../xhr');
var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');
var NewsFeedUsersStore = require('../stores/news_feed_users_store');

(function() {
  var rrMetaTag = document.getElementsByName('read-raptor-url');
  var READ_RAPTOR_URL = rrMetaTag && rrMetaTag[0] && rrMetaTag[0].content;
  var _stories = {};
  var _optimisticStories = {};
  var _store = Object.create(Store);

  var _newsFeedStore = _.extend(_store, {
    addStory: function(data) {
      if (!data) {
        return;
      }

      var story = data.story;

      _stories[story.key] = story;
    },

    applyReadTimes: function(data, stories) {
      for (var i = 0, l = data.length; i < l; i++) {
        var datum = data[i];

        if (datum.last_read_at && stories[datum.key]) {
          stories[datum.key].last_read_at = datum.last_read_at;
        }
      }
    },

    handleFetchedStories: function(err, data) {
      if (err) {
        return console.error(err);
      }

      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error(e);
      }

      var users = data.users;
      var stories = data.stories;

      if (!_.isEmpty(users)) {
        NewsFeedUsersStore.setUsers(users);
      }

      var url = READ_RAPTOR_URL +
        '/readers/' +
        app.currentUser().get('id') +
        '/articles?' +
        _.map(
          stories,
          function(s) {
            return 'key=' + s.key
          }
        ).join('&')

      window.xhr.noCsrfGet(url, this.handleReadRaptor(stories));
    },

    handleReadRaptor: function(stories, method) {
      var self = this;

      return function readRaptorCallback(err, data) {
        if (err) {
          return console.error(err);
        }

        try {
          data = JSON.parse(data);
        } catch (e) {
          return console.error(e);
        }

        stories = _.reduce(
          stories,
          function(hash, story) {
            hash[story.key] = story;
            hash[story.key].last_read_at = 0;

            return hash;
          },
          {}
        );

        self.applyReadTimes(data, stories);
        self.setStories(stories);
        self.emitChange();
      };
    },

    'newsFeed:acknowledge': function(timestamp) {},

    'newsFeed:fetchStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'newsFeed:fetchMoreStories': function(url) {
      window.xhr.get(url, this.handleFetchedStories.bind(this));
    },

    'newsFeed:markAsRead': function(storykey) {
      var url = '/user/tracking/' + storykey;

      window.xhr.get(url, this.markedAsRead(storykey));
    },

    'newsFeed:markAllAsRead': function() {
      var unread = _.filter(_stories, function(story) {
        return story.last_read_at === 0;
      });

      var self = this;

      for (var i = 0, l = unread.length; i < l; i++) {
        var story = unread[i];
        var url = '/user/tracking/' + story.key;

        window.xhr.get(url, self.markedAsRead(story.key, true, (i + 1 === l)));
      }
    },

    'newsFeed:markStoryAsRead': function(data) {
      var storyKey = data.key;
      var url = data.readraptor_url;

      window.xhr.noCsrfGet(url);

      _optimisticStories[storyKey] = {
        last_read_at: moment().unix()
      };

      this.emitChange();
    },

    markedAsRead: function(storyKey, wait, ready) {
      var self = this;

      return function markedAsRead(err, data) {
        if (err) {
          return console.error(err);
        }

        var story = self.getStory(storyKey);

        // FIXME: Use the value from Readraptor
        story.last_read_at = moment().unix();

        self.setStory(story);
        self.emitChange();
      }
    },

    getStory: function(key) {
      return _stories[key];
    },

    getStories: function() {
      var stories = [];

      for (var i in _stories) {
        stories.push(_stories[i]);
      }

      stories.sort(function(a, b) {
        return (b.updated - a.updated);
      });

      return stories;
    },

    getUnreadCount: function(timestamp) {
      var count = _.countBy(
        _stories,
        function(entry) {
          if (timestamp) {
            return entry.updated > entry.last_read_at && entry.updated > timestamp;
          }
        }
      );

      return count.true || 0;
    },

    setStory: function(story) {
      _stories[story.key] = story;
    },

    setStories: function(stories) {
      for (var story in _optimisticStories) {
        if (stories.hasOwnProperty(story)) {
          stories[story].last_read_at = _optimisticStories[story].last_read_at;
        }
      }

      _optimisticStories = {};

      for (var s in stories) {
        _stories[s] = stories[s];
      }
    },

    removeStory: function(key) {
      delete _stories[key];
    },

    removeAllStories: function() {
      _stories = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;
    var sync = payload.sync;

    if (!_store[action]) {
      return;
    }

    _store[action](data);

    if (sync) {
      return _store.emitChange(event);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = _newsFeedStore;
  }

  window.NewsFeedStore = _newsFeedStore;
})();
