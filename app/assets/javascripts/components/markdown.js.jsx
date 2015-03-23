'use strict'

const Classnames = require('classnames');

var Markdown = React.createClass({

  propTypes: {
    color: React.PropTypes.string,
    content: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
    ]).isRequired,
    normalized: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string
    ]),
    safelySetHtml: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      color: "gray-1",
      normalized: false,
      safelySetHtml: false
    }
  },

  componentDidMount: function() {
    // render internal react_ujs components
    var node = $(this.getDOMNode())
    node = node && node.find('[data-react-class]')
    ReactUjs.mountReactComponents(node)
  },

  render: function() {
    var cs = Classnames('markdown', this.props.color, {
      'markdown-normalized': !!this.props.normalized,
    })

    if (this.props.safelySetHtml) {
      return (
        <div className={cs}>
          {this.props.content}
        </div>
      )
    }

    return (
      <div className={cs} dangerouslySetInnerHTML={{ __html: this.props.content }} />
    )
  }
});

window.Markdown = module.exports = Markdown
