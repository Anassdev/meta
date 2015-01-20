/** @jsx React.DOM */

(function() {
  var Avatar = React.createClass({
    propTypes: {
      avatar_url: React.PropTypes.string,
      size: React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
      user: React.PropTypes.object,
      style: React.PropTypes.object
    },

    getDefaultProps: function() {
      return {
        size: 24,
        style: {}
      };
    },

    render: function() {
      var size = this.props.size.toString()
      var username = this.props.user.username

      return <img className="avatar"
          src={this.avatarUrl()}
          height={size}
          width={size}
          style={this.props.style}
          alt={this.props.user.username} />;
    },

    avatarUrl: function() {
      if (this.props.avatar_url) {
        return this.props.avatar_url
      }

      if (!this.props.user || !this.props.user.avatar_url || this.props.alwaysDefault) {
        return '/assets/avatars/default.png';
      }

      return this.props.user.avatar_url;
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = Avatar;
  }

  window.Avatar = Avatar;
})();
