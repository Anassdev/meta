/** @jsx React.DOM */

(function() {
  var BountyBreakdown = require('./bounty_breakdown.js.jsx');
  var BountyValuation = React.createClass({
    getInitialState: function() {
      return {
        shown: false,
      }
    },

    renderLightbox: function() {
      if(!this.state.shown) {
        return
      }

      return this.transferPropsTo(
        <BountyBreakdown onHidden={this.handleHide} steps={this.props.steps} />
      )
    },

    render: function() {
      return (
        <span>
          <a className="text-coins text-weight-bold" href="#" id="bounty-amount-link" onClick={this.toggle}>
            <span className="icon icon-app-coin"></span>
            {' '}
            {numeral(this.props.contracts.earnable).format('0,0')}
          </a>

          {this.renderLightbox()}
        </span>
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
