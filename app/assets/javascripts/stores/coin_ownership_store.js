var Dispatcher = require('../dispatcher');
var Store = require('../stores/store');

(function() {
  // { user: User, coins: Number }
  var _usersAndCoins = [];

  var _store = Object.create(Store);
  var _coinOwnershipStore = _.extend(_store, {
    addUser: function(data) {
      var userAndCoins = data.userAndCoins;

      if (_searchUsers(userAndCoins.username) !== -1) {
        return;
      }

      _usersAndCoins.push(userAndCoins);
    },

    getUser: function(data) {
      var index = _searchUsers(data.username);

      return _usersAndCoins[index];
    },

    getUsers: function() {
      return _usersAndCoins;
    },

    updateUser: function(data) {
      var userAndCoins = data.userAndCoins;
      var index = _searchUsers(userAndCoins.username);

      if (index === -1) {
        return;
      }

      _usersAndCoins[index] = userAndCoins;

      return _usersAndCoins[index];
    },

    removeUser: function(data) {
      var userAndCoins = data.userAndCoins;
      var index = _searchUsers(userAndCoins.username);

      if (index >= 0) {
        _usersAndCoins.splice(index, 1);
      }
    },

    setUsers: function(users) {
      _usersAndCoins = users;
    },

    removeAllUsers: function() {
      _usersAndCoins = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchUsers(username) {
    for (var i = 0, l = _usersAndCoins.length; i < l; i++) {
      var userAndCoins = _usersAndCoins[i];

      if (userAndCoins.username === username) {
        return i;
      }
    }

    return -1;
  }

  if (typeof module !== 'undefined') {
    module.exports = _coinOwnershipStore;
  }

  window.CoinOwnershipStore = _coinOwnershipStore;
})();
