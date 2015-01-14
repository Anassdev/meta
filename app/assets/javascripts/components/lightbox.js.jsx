var Lightbox = React.createClass({
  propTypes: {
    title:                React.PropTypes.any,
    showControlledOuside: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      size: '',
      showControlledOuside: false
    }
  },

  componentDidMount: function() {
    if (this.props.showControlledOuside) {
      var modal = $(this.getDOMNode()).modal({ show: true })
      modal.on('hidden.bs.modal', this.props.onHidden)
    }
  },

  render: function() {
    return (
      <div className="modal fade" id={this.props.id} role="dialog" tabIndex="-1" aria-labelledby={this.props.title || "lightbox"} aria-hidden="true">
        <div className={"modal-dialog " + this.props.size}>
          <div className="modal-content" style={{ overflow: 'visible' }}>
            {this.header()}
            {this.props.children}
          </div>
          {this.footer()}
        </div>
      </div>
    );
  },

  header: function() {
    if (this.props.title) {
      return <div className="px3 py2 clearfix">
        <a className="close" data-dismiss="modal">
          <span aria-hidden="true">&times;</span><span className="sr-only">Close</span>
        </a>
        <h4 className="mt0 mb0" id={this.props.title}>{this.props.title}</h4>
      </div>
    }
    return null
  },

  footer: function() {
    if (this.props.footer) {
      return <div className="p3 border-top">
        {this.props.footer}
      </div>
    }
    return null
  }
})

module.exports = Lightbox
