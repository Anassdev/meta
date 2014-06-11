/** @jsx React.DOM */

var People = React.createClass({
  render: function(){
    return (
      <div>
        <PeopleFilter
            interestFilters={this.props.interestFilters}
            selected={this.state.selected}
            onFilter={this.onFilter} />
        <hr/>
        <PeopleList
            memberships={this.state.filteredMemberships}
            selected={this.state.selected}
            onFilter={this.onFilter}
            currentUser={this.props.currentUser}
            updatePath={this.props.updatePath} />
      </div>
    )
  },

  componentWillMount: function() {
    this.onFilter(this.props.selected)
  },

  onFilter: function(interest) {
    var filteredMemberships = this.props.memberships;

    if (interest) {
      if (this.state && this.state.selected === interest) {
        return this.onFilter()
      }

      filteredMemberships = _.filter(this.props.memberships, function filterMemberships(m) {
        return _.include(m.interests, interest)
      })
    }

    var sortedMemberships = _.sortBy(filteredMemberships, function(m) {
      return (m.core_team ? '0' : '1') + m.user.username.toLowerCase()
    })

    this.setState({ filteredMemberships: sortedMemberships, selected: interest });
  }
})

var PeopleFilter = React.createClass({
  render: function() {
    var self = this;
    var highlightAll = self.props && !self.props.selected ? 'primary': 'default';

    var tags = _.map(this.props.interestFilters, function(interest){
      var label = '@' + interest;
      var highlight = self.props && self.props.selected === interest ? 'primary' : 'default';

      return (
        <a className={'btn btn-' + highlight}
            href={'#' + label}
            onClick={self.filterChanged(interest)}
            key={interest}>
          {label}
        </a>
      )
    })

    return (
      <div className="row">
        <div className="col-xs-2">
          Browse by:
        </div>
        <div className="col-xs-10 btn-group btn-group-sm">
            <a className={'text-muted btn btn-' + highlightAll}
                onClick={this.clearInterest}
                style={{cursor: 'pointer'}}>
              All
            </a>
            {tags}
        </div>
      </div>
    )
  },

  filterChanged: function(interest) {
    var self = this;
    return function(e) {
      self.props.onFilter(interest)
    };
  },

  clearInterest: function(e) {
    this.props.onFilter();
  }
})

var PeopleList = React.createClass({
  render: function() {
    return (
      <div className="list-group list-group-breakout list-group-padded">
        {this.rows(this.props.memberships)}
      </div>
    )
  },

  rows: function(memberships) {
    var self = this;

    var rows = [];

    for (var i = 0, l = memberships.length; i < l; i += 2) {
      var leftMember = memberships[i];
      var leftUser = leftMember.user;
      var rightMember = memberships[i + 1];
      var rightUser = rightMember && rightMember.user;

      var row = (
        <div className="row"
          key={'row-' + leftUser.id + (rightUser && rightUser.id)}
          style={{
            'padding-top': '15px',
            'padding-bottom': '15px',
            'border-bottom': '1px solid #d9d9d9'
          }}>
          {this.avatar(leftUser)}
          {this.member(leftMember)}
          {this.avatar(rightUser)}
          {this.member(rightMember)}
        </div>
      )

      rows.push(row);
    }

    return rows;
  },

  avatar: function(user) {
    if (!user) {
      return;
    }

    return (
      <div className="col-sm-1 col-xs-1">
        <a href={user.url} title={'@' + user.username}>
          <img src={user.avatar_url}
              className="avatar"
              alt={'@' + user.username}
              width="30"
              height="30" />
        </a>
      </div>
    );
  },

  member: function(member) {
    if (!member) {
      return;
    }

    var user = member.user;

    return (
      <div className="col-sm-5 col-xs-5">
        <p>
          <strong>
            <a href={user.url} title={'@' + user.username}>
              {user.username}
            </a>
          </strong>

          <span className="text-muted">
            {user.bio ? '—' + user.bio : ''}
          </span>
        </p>

        <div>
          <BioEditor
              member={member}
              currentUser={this.props.currentUser}
              updatePath={this.props.updatePath}
              originalBio={member.bio} />
        </div>
        <p style={{position: 'absolute', bottom: '0px'}}>
          <ul className="list-inline">
            {this.skills(member)}
          </ul>
        </p>
      </div>
    )
  },

  skills: function(membership) {
    var self = this;

    return _.map(membership.interests, function mapInterests(interest) {
      var label = '@' + interest;
      var highlight = self.props && self.props.selected === interest ? 'primary' : 'default';

      return (
        <li>
          <span className={'label label-' + highlight}
              key={membership.user.id + '-' + interest}>
            {label}
          </span>
        </li>
      );
    });
  }
})

var BioEditor = React.createClass({
  componentWillMount: function() {
    this.setState({ currentUser: this.props.currentUser, member: this.props.member, editing: false })
  },

  render: function() {
    var currentUser = this.state.currentUser;
    var member = this.state.member;

    if (!member || !currentUser) {
      return;
    }

    if (currentUser.id === member.user.id) {
      return (
        <div className="js-edit-bio text-muted" key={'b-' + currentUser.id}>
          {member.bio}
          {this.state.editing ? this.saveButton() : this.editButton()}
        </div>
      )
    }

    return (
      <p className="text-muted" key={'b-' + member.user.id}>
        {member.bio}
      </p>
    )
  },

  editButton: function() {
    return (
      <div className="btn-group btn-group-sm">
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.makeEditable}>Edit</a>
      </div>
    )
  },

  saveButton: function() {
    return (
      <div className="btn-group btn-group-sm">
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.saveBio}>Save</a>
        <a className="btn btn-link" style={{'box-shadow': 'none'}} onClick={this.makeUneditable}>Cancel</a>
      </div>
    )
  },

  makeEditable: function(e) {
    var member = this.state.member;
    var bio = this.props.originalBio;

    var editableBio = (
      <textarea className="form-control bio-editor" rows="2" defaultValue={bio}></textarea>
    )

    member.bio = editableBio;

    this.setState({ member: member, editing: true });
  },

  makeUneditable: function(e) {
    var member = this.state.member;

    member.bio = this.props.originalBio;

    this.setState({ member: member, editing: false });
  },

  saveBio: function(e) {
    var self = this;
    var bio = $('.bio-editor').val();
    var member = this.state.member;

    $.ajax({
      url: this.props.updatePath,
      method: 'PATCH',
      data: { bio: bio },
      success: function(data) {
        member.bio = data.user.bio;
        self.setState({ member: member, editing: false })
      },
      error: function(data, status) {
        console.error(status);
      }
    })
  }
})
