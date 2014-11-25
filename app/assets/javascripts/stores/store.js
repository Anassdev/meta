var EventEmitter = require('events').EventEmitter;
var CHANGE_EVENT = window.CONSTANTS.CHANGE_EVENT;

(function() {
  var Store = _.extend({}, EventEmitter.prototype, {
    emitChange: function() {
      this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
      this.removeListener(CHANGE_EVENT, callback);
    }
  });

  // suppress warnings about memory leaks that don't exist
  Store.setMaxListeners(0);

  if (typeof module !== 'undefined') {
    module.exports = Store;
  }

  window.Store = Store;
})();
