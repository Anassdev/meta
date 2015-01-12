var Avatar = require('./avatar.js.jsx')

var AvatarWithUsername = React.createClass({

  propTypes: {
    size: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      size: 24
    }
  },

  render: function() {
    return (
      <span>
        <div className="left mr1">
          <Avatar user={this.props.user} size={this.props.size} />
        </div>
        <span className="bold">{this.props.user.username}</span>
      </span>
    )
  }
})

module.exports = AvatarWithUsername
