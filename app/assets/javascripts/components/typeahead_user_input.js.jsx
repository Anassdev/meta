(function(){
  var USER_SEARCH_REGEX = /(^|\s)@(\w+)$/

  var TypeaheadUserInput = React.createClass({
    propTypes: {
      defaultValue: React.PropTypes.string,
      onTextChange: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        text: this.props.defaultValue,
        username: null
      }
    },

    render: function() {
      return <InPlaceUserSearch
          username={this.state.usernameSearch}
          onUserChanged={this.handleUserChanged}
          onUserSelected={this.handleUserSelected}
          searchPosition="bottom">
        <input {...this.props} onChange={this.handleChange} value={this.state.text} />
      </InPlaceUserSearch>
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (prevState.text !== this.state.text) {
        this.props.onTextChange(this.state.text)
      }
    },

    handleChange: function(e) {
      var username = null
      var matches = e.target.value.match(USER_SEARCH_REGEX)
      if (matches) {
        username = matches.slice(-1)[0] || ''
      }

      this.setState({
        text: e.target.value,
        usernameSearch: username
      })
    },

    handleUserChanged: function(user) {
      if (user) {
        this.setState({text: this.replaceQueryWithUser(user)})
      }
    },

    handleUserSelected: function(user) {
      if (user) {
        this.setState({text: this.replaceQueryWithUser(user)})
      }

      this.setState({usernameSearch: null})
    },

    replaceQueryWithUser: function(user, suffix) {
      return this.state.text.replace(USER_SEARCH_REGEX, function(match, space, username, offset, string){
        return space + '@' + user.username + (suffix || '')
      })
    },
  })

  if (typeof module !== 'undefined') {
    module.exports = TypeaheadUserInput;
  }

  window.TypeaheadUserInput = TypeaheadUserInput;
})()
