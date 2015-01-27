var IconWithNumber = require('./ui/icon_with_number.js.jsx')

var AppCoins = React.createClass({

  propTypes: {
    n: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <span className="text-coins">
        <IconWithNumber icon="app-coin" n={this.props.n} showZeros={true} />
      </span>
    )
  }
})

module.exports = window.AppCoins = AppCoins
