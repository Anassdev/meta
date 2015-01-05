var BountyActionCreators = require('../actions/bounty_action_creators');
var BountyStore = require('../stores/bounty_store');
var Markdown = require('./markdown.js.jsx');
var Icon = require('./icon.js.jsx');
var formatShortTime = require('../lib/format_short_time.js');
var Love = require('./love.js.jsx');
var routes = require('../routes')

var SubscriptionsStore = require('../stores/subscriptions_store')

var CLOSED_STATES = ['closed', 'resolved'];

var ONE_HOUR = 60 * 60 * 1000;

module.exports = React.createClass({
  displayName: 'Bounty',

  propTypes: {
    item: React.PropTypes.object.isRequired,
    noInvites: React.PropTypes.bool,
    showCoins: React.PropTypes.bool
  },

  abandonWork: function(e) {
    var stopWorkUrl = this.bounty().stop_work_url;

    BountyActionCreators.call(e, 'bounty.abandoned', stopWorkUrl);

    this.setState({
      worker: null,
      lockUntil: null
    });
  },

  bounty: function() {
    var propBounty = this.props.bounty;
    var stateBounty = this.state && this.state.bounty || {};

    return _.extend(propBounty, stateBounty);
  },

  closeBounty: function(e) {
    e.stopPropagation();

    BountyActionCreators.closeBounty(this.props.bounty.number);
  },

  componentDidMount: function() {
    BountyStore.addChangeListener(this.getBountyState);
    SubscriptionsStore.addChangeListener(this.getSubscriptionState);
  },

  componentWillUnmount: function() {
    BountyStore.removeChangeListener(this.getBountyState);
    SubscriptionsStore.removeChangeListener(this.getSubscriptionState);
  },

  extendWork: function(e) {
    var lockUrl = this.bounty().lock_url;

    BountyActionCreators.call(e, 'bounty.extended', lockUrl);

    var extendUntil = moment().add(60 * ONE_HOUR);

    this.setState({
      lockUntil: extendUntil
    });
  },

  getBountyState: function() {
    var bounty = this.state.bounty;
    var state = BountyStore.getState();

    bounty.state = state || bounty.state;

    this.setState({
      bounty: bounty,
      closed: state === 'closed'
    });
  },

  getInitialState: function() {
    var bounty = this.bounty();

    return {
      // :<
      bounty: bounty,
      closed: (CLOSED_STATES.indexOf(bounty.state) !== -1 ? true : false),
      worker: bounty.workers && bounty.workers[0],
      lockUntil: moment(bounty.locked_at).add(60 * ONE_HOUR),
      subscribed: SubscriptionsStore.get(this.props.item.id)
    };
  },

  getSubscriptionState: function() {
    this.setState({
      subscribed: SubscriptionsStore.get(this.props.item.id)
    });
  },

  render: function() {
    var bounty = this.bounty();

    return (
      <div>
        <div className="p3 border-bottom">
          <ul className="list-inline mb2" style={{ marginBottom: '6px' }}>
            {this.renderBountyValuation()}
            <li>
              {this.renderTagList()}
            </li>
            <li className="text-muted" style={{ fontSize: '14px', color: '#a5a5a5' }}>
              Created by
              {' '}
              <a className="text-stealth-link" href={bounty.user.url}>@{bounty.user.username}</a>
              {' '}
              {moment(bounty.created).fromNow()}
            </li>
          </ul>

          <h1 className="mt0 mb0" style={{ fontWeight: 'normal' }}>
            {this.state.bounty.title}
            {' '}
            <small style={{ fontSize: '85%' }}>
              <a href={bounty.url} className="gray">#{bounty.number}</a>
            </small>
          </h1>
        </div>

        <div className="p3">
          {this.renderDescription()}
        </div>

        {this.renderLove()}
        {this.renderFooter()}
        {this.renderDiscussion()}
      </div>
    );
  },

  renderBountyValuation: function() {
    if (this.props.showCoins) {
      return (
        <li className="text-large">
          <BountyValuation {...this.state.bounty} {...this.props.valuation} />
        </li>
      );
    }
  },

  renderClosedNotice: function() {
    var bounty = this.state.bounty;
    var closed = bounty.state === 'resolved' || bounty.state === 'closed'

    if (!closed) {
      return
    }

    return (
      <li className="omega">
        <a href="#" className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      </li>
    )
  },

  renderDescription: function() {
    var bounty = this.state.bounty;

    if (bounty.markdown_description) {
      return <Markdown content={bounty.markdown_description} normalized="true" />;
    }

    return <div className="gray">No description yet</div>;
  },

  renderDiscussion: function() {
    var item = this.props.item;
    var bounty = this.state.bounty;

    if (item) {
      return (
        <div id="discussion-view-el" key={'discussion-' + bounty.id}>
          <NewsFeedItemComments commentable={true} item={item} showAllComments={true} />
        </div>
      );
    }
  },

  renderEditButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          <a href={bounty.edit_url}>Edit</a>
        </li>
      );
    }
  },

  renderFlagButton: function() {
    var bounty = this.state.bounty;
    var currentUser = window.app.currentUser();
    var isStaff = currentUser && currentUser.get('staff');

    if (isStaff) {
      return (
        <li className="alpha">
          <ToggleButton
            bool={bounty.flagged}
            text={{ true: 'Unflag', false: 'Flag' }}
            classes={{ true: '', false: '' }}
            icon={{ true: 'flag', false: 'flag' }}
            href={{ true: bounty.unflag_url, false: bounty.flag_url }} />
        </li>
      );
    }
  },

  renderFollowButton: function() {
    var currentUser = window.app.currentUser();
    var bounty = this.state.bounty;

    if (currentUser) {
      return (
        <li>
          <ToggleButton
            bool={this.state.subscribed}
            text={{ true: 'Unsubscribe', false: 'Subscribe' }}
            icon={{ true: '', false: '' }}
            classes={{ true: '', false: '' }}
            href={{ true: routes.product_update_unsubscribe_path({ product_id: this.bounty().product.slug, update_id: this.props.item.id }),
                   false: routes.product_update_subscribe_path({ product_id: this.bounty().product.slug, update_id: this.props.item.id }) }} />
        </li>
      );
    }
  },

  renderFooter: function() {
    if (window.app.currentUser()) {
      return (
        <div className="card-footer p3 clearfix">
          <div className="left _pl1">
            {this.renderStartWorkButton()}
          </div>

          <ul className="list-inline mt0 mb0 py1 right _pr3">
            {this.renderEditButton()}
            {this.renderOpenButton()}
            {this.renderFollowButton()}
            {this.renderInviteFriendButton()}
          </ul>
        </div>
      );
    }

    return <div className="border-bottom" />;
  },

  renderInviteFriendButton: function() {
    if (this.props.noInvites) {
      return null;
    }

    var bounty = this.state.bounty;
    var closed = bounty.state == 'resolved' || bounty.state == 'closed'

    if (!closed) {
      return (
        <li>
          <InviteFriendBounty
            url={'/user/invites'}
            invites={bounty.invites}
            via_type={'Wip'}
            via_id={bounty.id} />
        </li>
      );
    }
  },

  renderLove: function() {
    if (this.props.item) {
      return (
        <div className="px3 py2 mb0 mt0 border-top">
          <Love heartable_id={this.props.item.id} heartable_type="NewsFeedItem" />
        </div>
      );
    }
  },

  renderOpenButton: function() {
    var bounty = this.state.bounty;

    if (bounty.can_update) {
      return (
        <li>
          {this.renderOpenOrClosedButton()}
        </li>
      )
    }
  },

  renderOpenOrClosedButton: function() {
    var bounty = this.state.bounty;

    if (bounty.state !== 'closed' && !this.state.closed) {
      return <a href="javascript:void(0);" onClick={this.closeBounty}>Close</a>;
    }

    return <a href="javascript:void(0);" onClick={this.reopenBounty}>Reopen</a>;
  },

  renderPopularizeButton: function() {
    var item = this.props.item;

    if (item && window.app.staff()) {
      return (
        <li className="alpha">
          <ToggleButton
            bool={item.popular_at !== null}
            text={{ true: 'Depopularize', false: 'Popularize' }}
            classes={{ true: 'btn btn-label', false: 'btn btn-label' }}
            icon={{ true: 'thumbs-down', false: 'fire' }}
            href={{ true: item.url + '/depopularize', false: item.url + '/popularize' }} />
        </li>
      );
    }
  },

  renderStartWorkButton: function() {
    var currentUser = window.app.currentUser();
    var bounty = this.bounty();

    if (this.state.closed || bounty.state === 'closed') {
      return (
        <a className="btn btn-default disabled">
          {bounty.state === 'resolved' ? 'Completed & Closed' : 'Closed'}
        </a>
      );
    }

    if (!currentUser) {
      return;
    }

    if (!this.state.worker) {
      return (
        <button className="btn btn-success mr2" type="button" onClick={this.startWork}>
          Work on this bounty
        </button>
      );
    }

    var worker = this.state.worker;

    if (worker.id === currentUser.id) {
      return (
        <div className="clearfix">
          <button className="inline-block left mr2 pill-button pill-button-theme-white pill-button-border pill-button-shadow"
              href="javascript:void(0);"
              style={{ color: '#5cb85c !important' }}
              data-scroll="true"
              data-target="#event_comment_body">
            <span className="icon icon-document icon-left"></span>
            <span className="title _fs1_1 _lh2">Submit work</span>
          </button>
          <div className="left h6 mt0 mb0 gray-darker">
            <Icon icon="lock" />
            {' '}
            We'll hold this task for you till {this.state.lockUntil.format('dddd [at] h a')}
            <br />
            <a href="javascript:void(0)" onClick={this.extendWork}>Hold until two days from now</a>
            {' '}
            or
            {' '}
            <a href="javascript:void(0)" onClick={this.abandonWork}>Release task</a>
          </div>
        </div>
      );  // '
    }

    return (
      <div className="py1 gray">
        <span className="mr1"><Icon icon="lock" /></span>
        {' '}
        <a className="gray-darker" href={worker.url}>
          <span style={{ opacity: '0.7' }}>
            <Avatar user={worker} style={{ display: 'inline' }} />
          </span>
          {' '} @{worker.username}
        </a>
        {' '} has {formatShortTime(this.state.lockUntil)} to work on this
      </div>
    )
  },

  renderTagList: function() {
    var bounty = this.state.bounty;
    var tags = _.map(bounty.tags, function(tag) { return tag.name });

    return (
      <TagList
        filterUrl={this.props.item.product.wips_url}
        destination={true}
        tags={tags}
        newBounty={true}
        url={bounty.tag_url} />
    );
  },

  reopenBounty: function(e) {
    e.stopPropagation();

    BountyActionCreators.reopenBounty(this.state.bounty.number);
  },

  startWork: function(e) {
    var currentUser = window.app.currentUser();
    var startWorkUrl = this.bounty().start_work_url;

    BountyActionCreators.call(e, 'bounty.started', startWorkUrl);

    this.setState({
      worker: currentUser && currentUser.attributes,
      lockUntil: moment().add(60, 'hours').add(1, 'second')
    });
  }
});

window.Bounty = module.exports
