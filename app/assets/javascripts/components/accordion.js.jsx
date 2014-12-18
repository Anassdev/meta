module.exports = window.Accordion = React.createClass({
  displayName: 'Accordion',

  propTypes: {
    title: React.PropTypes.string.isRequired,
  },

  getInitialState: function() {
    return {
      open: true
    }
  },

  render: function() {
    var core = null

    if (this.state.open) {
      core = <div className="core">{this.props.children}</div>
    }

    var chevron = null
    if (this.state.open) {
      chevron = <span className="icon icon-chevron-up fs3 lh2"></span>
    } else {
      chevron = <span className="icon icon-chevron-down fs3 lh2"></span>
    }

    return (
      <div className="accordion">
        <a className="pill-hover block black pointer noselect pl4 pr3 pb1 pt1 mln3 mrn3 mb1" onClick={this.toggleOpen}>
          <span className="block h5 mt0 mb0 bold inline-block w50p">
            {this.props.title}
          </span>
          <span className="inline-block gray-green w50p right-align">
            {chevron}
          </span>
        </a>
        {core}
      </div>
    )
  },

  toggleOpen: function() {
    this.setState({open: !this.state.open})
  }
})
