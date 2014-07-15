//= require dispatcher
//= require stores/store

var PersonPickerStore = (function() {
  var _people = [];

  var _store = Object.create(Store);
  var _personPickerStore = _.extend(_store, {
    addPerson: function(data) {
      var user = data.user;
      if (!user) {
        return;
      }
      
      if (_searchPeople(user.username) !== -1) {
        return;
      }

      _people.push(user);
    },

    getPerson: function(data) {
      var index = _searchPeople(data.user.username);

      return _people[index];
    },

    getPeople: function() {
      return _people;
    },

    updatePerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      _people[index] = user;

      return _people[index];
    },

    removePerson: function(data) {
      var user = data.user;
      var index = _searchPeople(user.username);

      if (index >= 0) {
        _people.splice(index, 1);
      }
    },

    setPeople: function(users) {
      _people = users;
    },

    removeAllPeople: function() {
      _people = [];
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;
    var event = payload.event;

    _store[action] && _store[action](data);
    _store.emit(event);
  });

  function _searchPeople(username) {
    for (var i = 0, l = _people.length; i < l; i++) {
      var user = _people[i];

      if (user.username === username) {
        return i;
      }
    }

    return -1;
  }

  return _personPickerStore;
})();
