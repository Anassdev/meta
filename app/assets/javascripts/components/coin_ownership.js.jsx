/** @jsx React.DOM */

var CONSTANTS = window.CONSTANTS;
// var Dispatcher = require('../dispatcher');
var CoinOwnershipStore = require('../stores/coin_ownership_store');
var Avatar = require('./ui/avatar.js.jsx');
var PersonPicker = require('./person_picker.js.jsx');

(function() {
  var CO = CONSTANTS.COIN_OWNERSHIP;

  function preventDefault(fn) {
    return function(e) {
      e.preventDefault()
      fn(e)
    }
  }

  var CoinOwnership = React.createClass({
    getDefaultProps: function() {
      return { totalCoins: parseInt(10000000 * 0.05, 10) };
    },

    componentDidMount: function() {
      CoinOwnershipStore.addChangeListener(this.onChange);
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
      var sharerCoins = _.reduce(_.map(this.state.sharers, func.dot('coins')), function(memo, num) { return memo + num; }, 0)

      return sharerCoins + this.state.creator.coins
    },

    unallocatedCoins: function() {
      return 10000000 - this.totalCoins();
    },

    render: function() {
      var creator = this.state.creator;

      return (
        <table className="table">
          <thead>
            <tr>
              <th colSpan="2">Partner</th>
              <th className="right-align">Coins</th>
              <th className="right-align" style={{width: 130}}>Ownership</th>
              <th></th>
            </tr>
          </thead>
          <tbody>

            <tr className="active">
              <td>&nbsp;</td>
              <td style={{'white-space':"nowrap"}}>Unallocated coins</td>
              <td className="right-align">
                <span className="icon icon-app-coin text-coins"></span>
                {numeral(this.unallocatedCoins()).format('0,0')}
              </td>
              <td></td>
              <td>&nbsp;</td>
            </tr>

            <tr className="">
              <td><Avatar user={creator} /></td>
              <td>
                @{creator.username}
              </td>
              <td className="right-align">
                <span style={{"white-space":"nowrap"}}>
                  <span className="icon icon-app-coin text-coins"></span>
                  {numeral(creator.coins).format('0,0')}
                </span>
              </td>
              <td className="right-align">
                <strong>{this.ownership(creator)}%</strong>
              </td>
              <td>
                <span className="gray-2">(you)</span>
              </td>
            </tr>

            {this.rows()}

            <tr>
              <td><Avatar user={this.state.potentialUser} alwaysDefault="true" /></td>
              <td colSpan="3">
                <PersonPicker ref="picker" url="/_es"
                              onUserSelected={this.handleUserSelected}
                              onValidUserChanged={this.handleValidUserChanged} />
              </td>
              <td>
                {this.addButton()}
              </td>
            </tr>
          </tbody>
        </table>
      )
    },

    addButton: function() {
      return (
        <a className="green"
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
      var users = CoinOwnershipStore.getUsers();

      for (var i = 0, l = users.length; i < l; i++) {
        if (!users[i].hasOwnProperty('coins')) {
          users[i].coins = 0;
        }
      }

      this.setState({
        sharers: users
      });
    },

    addUser: function(user) {
      user = _.extend(user, {coins: 0});

      this.setState(React.addons.update(this.state, {
        potentialUser: {$set: null},
        sharers: { $push: [user] }
      }));

      Dispatcher.dispatch({
        action: CO.ACTIONS.ADD_USER,
        data: { userAndCoins: user }
      });
    },

    rows: function() {
      return _.map(this.state.sharers, function(user) {
        return <OwnershipRow
          user={user}
          totalCoins={this.props.totalCoins}
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

        Dispatcher.dispatch({
          action: CO.ACTIONS.REMOVE_USER,
          data: { userAndCoins: user }
        });

        var creator = this.state.creator;

        creator.coins = creator.coins + user.coins;

        this.setState({
          sharers: users,
          creator: creator
        });

      }.bind(this);
    },

    handleOwnershipChanged: function(user) {
      // this needs to be completely rewritten to use the dispatcher and store(s)
      return function(ownership) {
        user.coins = Math.floor((ownership / 100) * this.props.totalCoins);

        var creator = this.state.creator;
        var sharers = this.state.sharers;

        var sharerCoins = _.reduce(
          _.map(sharers,
          func.dot('coins')),
          function(memo, coins) {
            return memo + coins;
          },
          0
        );

        creator.coins = this.props.totalCoins - sharerCoins || 0;

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
      var user = this.props.user;

      if (user.email) {
        return (
          <tr>
            <td><span className="gray-2 glyphicon glyphicon-envelope"></span></td>
            <td>
              {user.email}
            </td>
            <td className="right-align">
              <span style={{'white-space':"nowrap"}}>
                <span className="icon icon-app-coin text-coins"></span>
                {numeral(user.coins).format('0,0')}
              </span>
            </td>
            <td>
              <div className="input-group input-group-sm">
                <input ref="ownership" className="form-control right-align" type="number"
                       name={'ownership[' + user.email + ']'}
                       value={this.state.ownership}
                       onChange={this.handleOwnershipChanged} />
                <div className="input-group-addon">%</div>
              </div>
            </td>
            <td>
              <a href="#" onClick={preventDefault(this.props.onRemove)} className="gray-2 red-hover">
                <span className="icon icon-close"></span>
                <span className="sr-only">Remove</span>
              </a>
            </td>
          </tr>
        );
      } else {
        return (
          <tr>
            <td><Avatar user={user} /></td>
            <td>
              @{user.username}
            </td>
            <td className="right-align">
              <span style={{'white-space':"nowrap"}}>
                <span className="icon icon-app-coin text-coins"></span>
                {numeral(user.coins).format('0,0')}
              </span>
            </td>
            <td>
              <div className="input-group input-group-sm">
                <input ref="ownership" className="form-control right-align" type="number"
                       name={'ownership[' + user.id + ']'}
                       value={this.state.ownership}
                       onChange={this.handleOwnershipChanged} />
                <div className="input-group-addon">%</div>
              </div>
            </td>
            <td>
              <a href="#" onClick={preventDefault(this.props.onRemove)} className="gray-2 red-hover">
                <span className="icon icon-close"></span>
                <span className="sr-only">Remove</span>
              </a>
            </td>
          </tr>
        );
      }

    },

    handleOwnershipChanged: function(e) {
      var val = parseInt(e.target.value, 10);

      if (val < 0) {
        val = 0;
      }

      var user = this.props.user;
      var users = CoinOwnershipStore.getUsers();

      var sharerCoins = _.reduce(_.map(_.reject(users,
        function(s) {
          return s.username === user.username
        }),
        func.dot('coins')),
        function(memo, coins) {
          return memo + coins;
        },
      0);

      var percentageRemaining = 100 - Math.ceil(sharerCoins / this.props.totalCoins * 100);

      if (val >= percentageRemaining) {
        val = percentageRemaining;
      }

      this.setState({
        ownership: val
      });

      this.props.onOwnershipChanged(val);
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = CoinOwnership;
  }

  window.CoinOwnership = CoinOwnership;
})();
