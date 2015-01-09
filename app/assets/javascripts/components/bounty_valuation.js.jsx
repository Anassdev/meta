/** @jsx React.DOM */

(function() {
  var AppCoins = require('./app_coins.js.jsx')
  var BountyBreakdown = require('./bounty_breakdown.js.jsx');
  var Icon = require('./ui/icon.js.jsx')

  var BountyValuation = React.createClass({
    propTypes: {
      contracts: React.PropTypes.object.isRequired,
      product: React.PropTypes.object.isRequired,
      url: React.PropTypes.string,
      maxOffer: React.PropTypes.number,
      averageBounty: React.PropTypes.number,
      coinsMinted: React.PropTypes.number,
      profitLastMonth: React.PropTypes.number
    },

    getInitialState: function() {
      return {
        shown: false,
      }
    },

    renderLightbox: function() {
      if (this.state.shown) {
        return <BountyBreakdown {...this.props} onHidden={this.handleHide} steps={this.props.steps} />
      }
    },

    render: function() {
      return (
        <div>
          <a className="block clearfix" href="#" id="bounty-amount-link" onClick={this.toggle}>
            <div className="left">
              <AppCoins n={this.props.contracts.earnable} />
            </div>
            <div className="left yellow ml1">
              <Icon icon="chevron-down" />
            </div>
          </a>

          {this.renderLightbox()}
        </div>
      )
    },

    toggle: function(event) {
      this.setState({
        shown: !this.state.shown
      });

      event.stopPropagation();
      event.preventDefault();
    },

    handleHide: function() {
      this.setState({
        shown: false
      });
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyValuation;
  }

  window.BountyValuation = BountyValuation;
})();
