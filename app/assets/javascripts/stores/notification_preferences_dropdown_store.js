(function() {
  var PublicAddressPrompt = require('../components/public_address_prompt.js.jsx');
  var xhr = require('../xhr');
  var Dispatcher = require('../dispatcher');
  var Store = require('../stores/store');
  var _selected;

  var _store = Object.create(Store);

  var _dropdownStore = _.extend(_store, {
    showPublicAddressModal: function(data) {
      if (!data) {
        return;
      }

      var path = data.path;
      var preference = data.preference;
      var redirectTo = data.redirectTo;

      React.renderComponent(PublicAddressPrompt({
        path: path,
        redirectTo: redirectTo
      }), document.getElementById('public-address-prompt'));
    },

    updateSelected: function(data) {
      if (!data) {
        return;
      }

      var path = data.path;
      var preference = data.preference;
      var redirectTo = data.redirectTo;
      var publicAddress = data.publicAddress;

      window.xhr.post(path, { public_address: publicAddress }, function(){
        if (data.redirectTo) {
          app.redirectTo(redirectTo)
        }
      });

      _selected = preference;
    },

    getSelected: function() {
      return _selected;
    },

    setSelected: function(preference) {
      _selected = preference;
    },

    removeSelected: function() {
      _selected = undefined;
    }
  });

  _store.dispatchIndex = Dispatcher.register(function(payload) {
    var action = payload.action;
    var data = payload.data;

    if (!_store[action]) {
      return;
    }

    _store[action] && _store[action](data);
    _store.emitChange();
  });

  if (typeof module !== 'undefined') {
    module.exports = _dropdownStore;
  }

  window.NotificationPreferencesDropdownStore = _dropdownStore;
})();
