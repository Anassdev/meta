var EventEmitter = require('events').EventEmitter
var ActionTypes = window.CONSTANTS.ActionTypes

var _dispatchToken
var _bounties = []
var _loading = false
var _page = 0
var _pages = 0

class BountiesStore extends EventEmitter {
  constructor() {
    super()

    _dispatchToken = Dispatcher.register((action) => {
      switch(action.type) {
        case ActionTypes.BOUNTIES_REQUEST:
          _bounties = []
          _loading = true
          this.emit('change')
          break

        case ActionTypes.BOUNTIES_RECEIVE:
          _bounties = action.bounties
          _loading = false
          _page = action.page
          _pages = action.pages
          this.emit('change')
          break

        case ActionTypes.BOUNTIES_REORDER:
          _bounties = action.bounties
          this.emit('change')
          break
      }
    })
  }

  getBounties() {
    return _bounties
  }

  getLoading() {
    return _loading
  }

  getPage() {
    return _page
  }

  getPages() {
    return _pages
  }
}

var store = new BountiesStore()

var dataTag = document.getElementById('BountiesStore')
if (dataTag) {
  data = JSON.parse(dataTag.innerHTML)

  Dispatcher.dispatch({
    type: ActionTypes.BOUNTIES_RECEIVE,
    bounties: data.bounties,
    page: data.meta.pagination.page,
    pages: data.meta.pagination.pages
  })
}

module.exports = store
