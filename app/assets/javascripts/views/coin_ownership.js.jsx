/** @jsx React.DOM */

//= require constants
//= require dispatcher
//= require stores/coin_ownership_store

(function() {
  var CO = CONSTANTS.COIN_OWNERSHIP;

  function dot(prop) {
    return function(object) {
      return object[prop]
    }
  }

  function preventDefault(fn) {
    return function(e) {
      e.preventDefault()
      fn(e)
    }
  }

  window.CoinOwnership = React.createClass({
    getDefaultProps: function() {
      return { totalCoins: 6000 };
    },

    componentDidMount: function() {
      CoinOwnershipStore.addChangeListener(CO.EVENTS.USER_ADDED, this.onChange);
      CoinOwnershipStore.addChangeListener(CO.EVENTS.USER_UPDATED, this.onChange);
      CoinOwnershipStore.addChangeListener(CO.EVENTS.USER_REMOVED, this.onChange);
    },

    getInitialState: function() {
      return {
        creator: _.extend(app.currentUser().attributes, { coins: this.props.totalCoins }),
        sharers: CoinOwnershipStore.getUsers(),
        percentageAvailable: 0,
        potentialUser: null
      }
    },

    ownership: function(user) {
      return Math.max(
        0, Math.min(
          100, parseInt(user.coins * 100 / this.totalCoins(), 10)
        )
      )
    },

    totalCoins: function() {
      var sharerCoins = _.reduce(_.map(this.state.sharers, dot('coins')), function(memo, num) { return memo + num; }, 0)

      return sharerCoins + this.state.creator.coins
    },

    render: function() {
      var creator = this.state.creator;

      return (
        <table className="table">
          <thead>
            <tr>
              <th colSpan="2">Partner</th>
              <th className="text-right" style={{width: 130}}>Ownership</th>
              <th className="text-right">Coins</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr className="active">
              <td><Avatar user={creator} /></td>
              <td>
                @{creator.username}
              </td>
              <td className="text-right">
                <strong>{this.ownership(creator)}%</strong>
              </td>
              <td className="text-right">
                <span className="text-coins" style={{"white-space":"nowrap"}}>
                  <span className="icon icon-app-coin"></span>
                  {creator.coins}
                </span>
              </td>
              <td className="text-right">
                <span className="text-muted">(you)</span>
              </td>
            </tr>

            {this.rows()}

            <tr>
              <td><Avatar user={this.state.potentialUser} /></td>
              <td>
                <PersonPicker ref="picker" url="/_es"
                              onUserSelected={this.handleUserSelected}
                              onValidUserChanged={this.handleValidUserChanged} />
              </td>
              <td>
                <div className="input-group input-group-sm">

                  <input className="form-control text-right" type="number" value={this.state.percentageAvailable} onChange={this.handleInputChange} />
                  <div className="input-group-addon">%</div>
                </div>
              </td>
              <td>
                <span className="text-coins" style={{'white-space':"nowrap"}}>
                  <span className="icon icon-app-coin"></span>
                  0
                </span>
              </td>
              <td className="text-right">
                {this.addButton()}
              </td>
            </tr>
          </tbody>
        </table>
      )
    },

    addButton: function() {
      return (
        <a className="text-success"
            style={{cursor: 'pointer'}}
            onClick={this.state.potentialUser ? this.addUserClicked : ''}>
          <span className="icon icon-plus-circled"></span>
          <span className="sr-only">Add</span>
        </a>
      );
    },

    handleUserSelected: function(user) {
      this.addUser(user)
    },

    handleValidUserChanged: function(user) {
      this.setState({
        potentialUser: user
      });
    },

    addUserClicked: function(e) {
      e.preventDefault()
      this.addUser(this.state.potentialUser);
      this.refs.picker.clearText();
    },

    onChange: function() {
      this.setState({
        sharers: CoinOwnershipStore.getUsers()
      });
    },

    addUser: function(user) {
      var user = _.extend(user, {coins: 0});

      this.setState(React.addons.update(this.state, {
        potentialUser: {$set: null},
        sharers: { $push: [user] }
      }));

      Dispatcher.dispatch({
        event: CO.EVENTS.USER_ADDED,
        action: CO.ACTIONS.ADD_USER,
        data: { userAndCoins: user }
      });
    },

    rows: function() {
      return _.map(this.state.sharers, function(user) {
        return <OwnershipRow
          user={user}
          ownership={this.ownership(user)}
          onRemove={this.handleUserRemoved(user)} key={user.id || user.email}
          onOwnershipChanged={this.handleOwnershipChanged(user)} />
      }.bind(this))
    },

    handleUserRemoved: function(user) {
      return function() {
        var users = _.reject(this.state.sharers, function(u){
          if (u.id) {
            return u.id == user.id
          } else if (u.email) {
            return u.email == user.email
          }
        });

        this.setState({
          sharers: users
        });

      }.bind(this);
    },

    handleOwnershipChanged: function(user) {
      // this needs to be completely rewritten to use the dispatcher and store(s)
      return function(ownership, callback) {
        user.coins = Math.floor((ownership / 100) * this.props.totalCoins);

        var creator = this.state.creator;
        var sharers = this.state.sharers;

        creator.coins = this.props.totalCoins - user.coins;

        var sharerCoins = _.reduce(_.map(_.reject(sharers,
          function(s) {
            return s.username === user.username
          }),
          dot('coins')),
          function(memo, coins) {
            return memo + coins;
          },
        0);

        var coinsAvailable = creator.coins - sharerCoins;

        if (ownership > coinsAvailable) {
          ownership = coinsAvailable;
        }

        if (callback) {
          callback(ownership);
        }

        this.setState({
          sharers: this.state.sharers,
          creator: creator
        });

      }.bind(this)
    }
  });


  var OwnershipRow = React.createClass({
    getInitialState: function() {
      return {
        ownership: 0
      };
    },

    render: function() {
      var user = this.props.user
      return (
        <tr>
          <td><Avatar user={user} /></td>
          <td>
            @{user.username}
          </td>
          <td>
            <div className="input-group input-group-sm">

              <input ref="ownership" className="form-control text-right" type="number"
                     value={this.state.ownership}
                     onChange={this.handleOwnershipChanged} />
              <div className="input-group-addon">%</div>
            </div>
          </td>
          <td className="text-right">
            <span className="text-coins" style={{'white-space':"nowrap"}}>
              <span className="icon icon-app-coin"></span>
              {user.coins}
            </span>
          </td>
          <td className="text-right">
            <a href="#" onClick={preventDefault(this.props.onRemove)} className="text-muted link-hover-danger">
              <span className="icon icon-close"></span>
              <span className="sr-only">Remove</span>
            </a>
          </td>
        </tr>
      )
    },

    handleOwnershipChanged: function(e) {
      var val = parseInt(e.target.value, 10); // this.refs.ownership.getDOMNode().value

      var users = CoinOwnershipStore.getUsers();
      console.log(users);
      
      this.props.onOwnershipChanged(val, function(newVal) {
        this.setState({
          ownership: newVal
        });
      }.bind(this));
    }
  });

})();
