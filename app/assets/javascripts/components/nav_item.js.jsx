var NavItem = React.createClass({
  displayName: 'NavItem',

  renderBadge: function() {
    var hasBadge = this.props.badge

    if (hasBadge) {
      return <span className="new-nav-item-badge" />
    }
  },

  render: function() {
    var label = this.props.label
    var isActive = this.props.active

    var badge = this.renderBadge()

    var classes = React.addons.classSet({
      'new-nav-item': true,
      'new-nav-item-is-active': isActive
    })

    return (
      <li className={classes}>
        <a href="#">
          {label}
          {badge}
        </a>
      </li>
    )
  }
})

window.NavItem = module.exports = NavItem
