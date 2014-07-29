/** @jsx React.DOM */

//= require constants
//= require dispatcher

(function() {
  window.FullPageNewsFeed = React.createClass({
    render: function() {
      var placeholderStyle;

      if (!this.state.rows) {
        placeholderStyle = { height: '800px' };
      } else {
        placeholderStyle = {};
      }

      return (
        <div className="sheet">
          <div className="page-header sheet-header" style={{ 'padding-left': '20px' }}>
            <h2 className="page-header-title">Your notifications</h2>
          </div>

          <div className="list-group list-group-breakout" style={placeholderStyle}>
            {this.state.stories ? this.rows(this.state.stories) : null}
          </div>

          <a href="#more" className="btn btn-block" onClick={this.moreStories}>More</a>
        </div>
      );
    },

    rows: function(stories) {
      var rows = [];

      for (var i = 0, l = stories.length; i < l; i++) {
        rows.push(
          <div className="list-group-item" key={stories[i].key}>
            <Entry story={stories[i]} actors={this.state.actors} fullPage={this.props.fullPage} />
          </div>
        );
      }

      return rows;
    }
  });

  var Entry = React.createClass({
    render: function() {
      var actors = _.map(this.actors(), func.dot('username')).join(', @')

      var classes = React.addons.classSet({
        'entry-read': this.isRead(),
        'entry-unread': !this.isRead(),
      });

      var productName = this.props.story.product.name;

      return (
        <div>
          <div className='row'>
            <div className='col-md-3'>
              <a href={'/' + productName}>{productName}</a>
              <br />
              <span className='text-muted text-small'>
                {this.timestamp()}
              </span>
            </div>
            <div className='col-md-9'>
              <a className={classes} href={this.props.story.url}>
                <span style={{ 'margin-right': '5px' }}>
                  <Avatar user={this.actors()[0]} />
                </span>
                <strong>{actors}</strong> {this.body()}
              </a>
              <span className='text-small text-muted'>
                {this.preview()}
              </span>
            </div>
          </div>
        </div>
      );
    },

    timestamp: function() {
      return moment(this.props.story.created).format("ddd, hA")
    },

    body: function() {
      var target = this.props.story.activities[0].target;

      return (
        <span>
          {this.verbMap[this.props.story.verb]}
          <strong>
            {this.subjectMap[this.props.story.subject_type].call(this, target)}
          </strong>
        </span>
      );
    },

    isRead: function() {
      var readAt = this.props.story.read_at;
      return readAt != null;
    },

    preview: function() {
      var bodyPreview = this.props.story.body_preview;

      return (
        <p className='text-muted' style={{ 'text-overflow': 'ellipsis' }}>
          {bodyPreview}
        </p>
      );
    },

    actors: function() {
      return _.map(
        this.props.story.actor_ids,
        function(actorId) {
          return _.findWhere(this.props.actors, { id: actorId })
        }.bind(this)
      );
    },

    componentDidMount: function() {
      if (this.refs.body) {
        this.refs.body.getDOMNode().innerHTML = this.props.story.subject.body_html;
      }
    },

    verbMap: {
      'Comment': 'commented on ',
      'Award': 'awarded',
      'Close': 'closed '
    },

    subjectMap: {
      Task: function(task) {
        if (this.props.fullPage) {
          return "#" + task.number + " " + task.title
        }

        return "#" + task.number;
      },

      Discussion: function() {
        return 'discussion'
      },

      Wip: function(bounty) {
        if (this.props.fullPage) {
          return "#" + bounty.number + " " + bounty.title
        }

        return "#" + bounty.number;
      },
    }
  });
})();
