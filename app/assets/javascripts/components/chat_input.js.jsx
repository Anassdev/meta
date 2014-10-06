/** @jsx React.DOM */

(function(){
  var ENTER_KEY = 13

  var subscribing;

  var Set = require('Set')

  var ChatInput = React.createClass({
    propTypes: {
      room: React.PropTypes.string.isRequired,
      url: React.PropTypes.string.isRequired,
      username: React.PropTypes.string.isRequired
    },

    getInitialState: function() {
      return {
        message: this.props.message || '',
        typingUsernames: []
      }
    },

    componentDidMount: function() {
      // grabbing a pusher channel outside of react. We can fix this when chat is all reactified
      subscribing = setInterval(this.subscribeToPresenceChannel, 50)
    },

    subscribeToPresenceChannel: function() {
      if (window.presenceChannel) {
        this.channel = window.presenceChannel
        this.channel.bind('client-typing', this.handleSomeoneTyping, this)
        clearInterval(subscribing)
      }
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (prevState.message === '' && this.state.message !== '') {
        this.channel.trigger('client-typing', { add: this.props.username})
      } else if (prevState.message !== '' && this.state.message === '') {
        this.channel.trigger('client-typing', { remove: this.props.username})
      }
    },

    handleSomeoneTyping: function(msg) {
      var usernames = new Set(this.state.typingUsernames)
      if (msg.add) {
        usernames.add(msg.add)
      } else {
        usernames.remove(msg.remove)
      }
      this.setState({typingUsernames: usernames.toArray()})
    },

    render: function() {
      var inputStyle = {"overflow": "hidden", "word-wrap": "break-word", "resize": "none", "height": "38px"}
      return <div className="media-body" id="comment">
        <div className="js-markdown-editor js-dropzone">
          <textarea className="form-control" rows="1" style={inputStyle}
            onKeyPress={this.handleKeyDown(ENTER_KEY)}
            onChange={this.handleChange} value={this.state.message} />
        </div>
        <ChatTypingLabel usernames={this.state.typingUsernames} />
      </div>
    },

    handleChange: function(e) {
      this.setState({message: e.target.value});
    },

    handleKeyDown: function(keycode) {
      return function(e) {
        if (e.charCode !== keycode || e.shiftKey) {
          return
        }
        this.handleEnter(e)
      }.bind(this)
    },

    handleEnter: function(e) {
      e.preventDefault()

      var comment = new Comment({
        body: this.state.message
      })

      if (comment.isValid()) {
        this.submitComment(comment)
      }
    },

    submitComment: function(comment) {
      comment.url = this.props.url

      window.app.trigger('comment:scheduled', comment)
      this.setState({message: ''})
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = ChatInput
  }

  window.ChatInput = ChatInput
})()
