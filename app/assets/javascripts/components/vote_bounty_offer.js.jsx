/** @jsx React.DOM */

(function() {
  var VoteBountyOffer = React.createClass({
    getDefaultProps: function() {
      return {
        user: app.currentUser()
      }
    },

    getInitialState: function() {
      return {
        toggle: 'simple'
      }
    },

    handleToggleClick: function() {
      this.setState({
        toggle: this.state.toggle == 'simple' ? 'custom' : 'simple'
      })
    },

    handleClick: function(toggle) {
      return function() {
        this.setState({
          toggle: toggle
        })
      }.bind(this)
    },

    renderValueControl: function() {
      if(this.state.toggle === 'simple') {
        return this.transferPropsTo(<SimpleBountyOffer />)
      } else {
        return this.transferPropsTo(<CustomBountyOffer />)
      }
    },

    render: function() {
      return (
        <div>
          <ul className="px3 nav nav-tabs nav-slim h6 mt0 mb0">
            <li className={this.state.toggle == 'simple' ? 'active' : null}>
              <a onClick={this.handleClick('simple')} href="#" style={{ 'line-height': '1.5rem', 'padding-top': 12, 'padding-bottom': 9 }}>
                Simple
              </a>
            </li>
            <li className={this.state.toggle == 'custom' ? 'active' : null}>
              <a onClick={this.handleClick('custom')} href="#" style={{ 'line-height': '1.5rem', 'padding-top': 12, 'padding-bottom': 9 }}>
                Custom
              </a>
            </li>
          </ul>

          <div className="p3">
            {this.renderValueControl()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = VoteBountyOffer;
  }

  window.VoteBountyOffer = VoteBountyOffer;
})();
