'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');
const Immutable = require('immutable');
const Store = require('./es6_store');

var metrics = null;

class ProductMetricsStore extends Store {
  constructor() {
    super()

    this.dispatchToken = Dispatcher.register((action) => {
      switch (action.type) {
        case ActionTypes.PRODUCT_METRICS_RECEIVED:
          metrics = Immutable.List(action.data)
          this.emitChange()
          break
      }
    })
  }

  getAll() {
    if (metrics.size == 1) {
      // 1 length metrics breaks the chart :(
      return Immutable.List()
    }
    return metrics
  }
}

module.exports = new ProductMetricsStore()
