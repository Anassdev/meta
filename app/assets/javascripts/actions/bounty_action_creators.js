// var Dispatcher = require('../dispatcher')

var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;
var BountiesStore = require('../stores/bounties_store.js');

var BountyActionCreators = {
  call: function(e, eventName, url) {
    e.preventDefault();

    _track(eventName);
    _patch(url);
  },

  requestBounties: function(productSlug, params) {
    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REQUEST,
      bounties: []
    });

    var path = ['/', productSlug, '/', 'bounties', '.', 'json'].join('');

    $.ajax({
      url: path,
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(response) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTIES_RECEIVE,
          bounties: response.bounties,
          page: response.meta.pagination.page,
          pages: response.meta.pagination.pages
        });
      }
    });
  },

  requestNextPage: function(productSlug, params) {
    var loading = BountiesStore.getLoading()
    var page = BountiesStore.getPage()
    var pages = BountiesStore.getPages()

    if (loading || page == pages) {
      return
    }

    var bounties = BountiesStore.getBounties()

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REQUEST,
      bounties: bounties
    });

    var path = ['/', productSlug, '/', 'bounties', '.', 'json'].join('');
    params['page'] = page + 1

    $.ajax({
      url: path,
      type: 'GET',
      dataType: 'json',
      data: params,
      success: function(response) {
        Dispatcher.dispatch({
          type: ActionTypes.BOUNTIES_RECEIVE,
          bounties: bounties.concat(response.bounties),
          page: response.meta.pagination.page,
          pages: response.meta.pagination.pages
        });
      }
    });
  },

  requestBountiesDebounced: _.debounce(function(productSlug, params) {
    this.requestBounties(productSlug, params);
  }, 300),

  insertPlaceholder: function(index, height) {
    var bounties = BountiesStore.getBounties()
    var placeholder = {
      placeholder: true,
      height: height
    }

    bounties.splice(index, 0, placeholder)

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    })
  },

  movePlaceholder: function(bountyId) {
    var bounties = BountiesStore.getBounties()

    var oldIndex = _.pluck(bounties, 'placeholder').indexOf(true)
    var placeholder = bounties[oldIndex]

    var newIndex = _.pluck(bounties, 'id').indexOf(bountyId)
    var bounty = bounties[newIndex]

    bounties[newIndex] = placeholder
    bounties[oldIndex] = bounty

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    })
  },

  placeBounty: function(bounty) {
    var bounties = BountiesStore.getBounties();

    var oldIndex = bounties.indexOf(bounty);
    bounties.splice(oldIndex, 1)

    var newIndex = _.pluck(bounties, 'placeholder').indexOf(true)
    bounties.splice(newIndex, 1, bounty)

    Dispatcher.dispatch({
      type: ActionTypes.BOUNTIES_REORDER,
      bounties: bounties
    })

    var above = bounties[newIndex + 1]
    var below = bounties[newIndex - 1]
    var data = { task: null }

    if(above) {
      data.task = { priority_above_id: above.id }
    } else {
      data.task = { priority_below_id: below.id }
    }

    var path = ['/', bounty.product.slug, '/', 'bounties', '/', bounty.number, '.', 'json'].join('');

    $.ajax({
      url: path,
      type: 'PATCH',
      dataType: 'json',
      data: data
    });
  }
};

function _patch(url) {
  _request('PATCH', url);
}

function _request(method, url) {
  // TODO: Dispatch success or error

  $.ajax({
    url: url,
    method: method,
    headers: {
      'accept': 'application/json'
    },
    success: function(data) {},
    error: function(jqXhr, status, error) {
      console.error(error);
    }
  });
}

function _track(eventName) {
  var product = window.app.currentAnalyticsProduct();
  var user = window.app.currentUser();

  window.analytics.track(eventName, {
    product: (product ? product.attributes : {}),
    user: (user ? user.attributes : {})
  });
}

module.exports = BountyActionCreators;
