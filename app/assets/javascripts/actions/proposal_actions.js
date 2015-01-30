var ActionTypes = window.CONSTANTS.ActionTypes;
var ProductStore = require('../stores/product_store.js')

var ProposalActions = {

  vote: function(proposal_id) {
    var product_slug = ProductStore.getSlug()
    var newurl = "https://www.assembly.com/"+{product_slug}+"/governance"
    var choicedata = {proposal_id: proposal_id}

    var proposalComponent = this
    $.ajax({
      method: 'POST',
      url: "/choices",
      json: true,
      data: choicedata,
      success: function(data) {
        Dispatcher.dispatch({
          type: ActionTypes.PROPOSAL_VOTE,
          percent: data.progress,
          approved: data.approved,
          state: data.state
        });
      }
    });
  },

  init: function(percent, approved, state) {
    Dispatcher.dispatch({
      type: ActionTypes.PROPOSAL_INIT,
      percent: percent,
      approved: approved,
      state: state
    })
  }

};

module.exports = ProposalActions;
