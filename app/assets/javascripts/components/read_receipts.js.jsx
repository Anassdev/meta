/** @jsx React.DOM */

(function(){
  var ReadReceipts = React.createClass({
    getDefaultProps: function() {
      return {
        currentUser: window.app.currentUser().attributes
      }
    },

    getInitialState: function() {
      return {
        readers: null
      }
    },

    componentDidMount: function() {
      this.markAsRead()
      this.getReadReceipts()
    },

    componentDidUpdate: function() {
      $(this.getDOMNode()).tooltip({title: this.usernames})
    },

    render: function() {
      if (this.state.readers === null || this.state.readers.length === 0) {
        return <span />
      }

      return <span className="text-muted text-small" style={{"margin-left": "5px"}}>
        seen by {this.state.readers.length} {app.pluralized(this.state.readers.length, 'person', 'people')}
      </span>
    },

    usernames: function() {
      var alphabetical = _.sortBy(this.state.readers, function(username) { username.toLowerCase() })
      return _.map(alphabetical, function(username){ return '@' + username }).join(' ')
    },

    getReadReceipts: function() {
      xhr.noCsrfGet(this.props.url, function(err, body) {
        if (err) {
          return console.error(err)
        }

        var article = JSON.parse(body)

        var otherUsers = _.without(article.read_by, (this.props.currentUser && this.props.currentUser.username))

        this.setState({ readers: otherUsers })
      }.bind(this))
    },

    markAsRead: function() {
      if (this.props.track_url) {
        xhr.noCsrfGet(this.props.track_url)
      }
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = ReadReceipts
  }

  window.ReadReceipts = ReadReceipts
})()

