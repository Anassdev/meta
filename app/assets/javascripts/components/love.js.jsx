/** @jsx React.DOM */

(function(){
  var LoveStore = require('../stores/love_store')
  var LoveActionCreators = require('../actions/love_action_creators')
  var xhr = require('../xhr')

  var Love = React.createClass({
    propTypes: {
      heartable_id: React.PropTypes.string.isRequired,
      heartable_type: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
      return this.getStateFromStore()
    },

    componentDidMount: function() {
      LoveStore.addChangeListener(this._onChange)
    },

    componentWillUnmount: function() {
      LoveStore.removeChangeListener(this._onChange)
    },

    render: function() {
      var style = {}

      if (this.state.user_heart) {
        style['color'] = 'red'
      }

      return <span>
        <a href="javascript:;" onClick={this.handleClick}>
          <span className="glyphicon glyphicon-heart" style={style}></span>
          <span> {numeral(this.state.hearts).format('0,0')}</span>
        </a>
      </span>
    },

    handleClick: function() {
      var hearts = this.state.hearts
      if (this.state.user_heart) {
        LoveActionCreators.clickUnlove(this.props.heartable_type, this.props.heartable_id)
      } else {
        LoveActionCreators.clickLove(this.props.heartable_type, this.props.heartable_id)
      }
    },

    getStateFromStore: function() {
      return LoveStore.get(this.props.heartable_id)
    },

    _onChange: function() {
      this.replaceState(this.getStateFromStore())
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = Love
  }

  window.Love = Love
})()
