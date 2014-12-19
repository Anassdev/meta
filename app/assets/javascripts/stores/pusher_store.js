var Store = require('./es6_store')
var ActionTypes = window.CONSTANTS.ActionTypes;
var UserStore = require('./user_store');

var _dispatchToken = null,
    _client = null

class PusherStore extends Store {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.PUSHER_INITIALIZED:
          _client = action.client

          if (UserStore.getUser() && _client) {
            _client.
              subscribe('user.' + UserStore.getId()).
              bind_all((payload, data) => {
                Dispatcher.dispatch({
                  type: ActionTypes.PUSHER_USER_ACTION,
                  event: payload,
                  payload: data
                })
              });
          }

          this.emitChange()
          break;
      }
    })
  }

  getClient() {
    return _client
  }

  getDispatchToken() {
    return _dispatchToken
  }
}

module.exports = new PusherStore()
