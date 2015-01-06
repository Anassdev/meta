var ListItemMixin = {
  onModalHidden: function() {
    this.setState({
      modalShown: false
    });
  },

  renderComments: function(count) {
    return [
      <Icon icon="comment" />,
      <span className="px1" style={{marginLeft: '-2px'}}>
        {count}
      </span>
    ];
  },

  renderLove: function(heartableId) {
    if (!heartableId) {
      return;
    }

    return (
      <div className="px3 py2 border-top mb0 mt0">
        <Love heartable_type='NewsFeedItem' heartable_id={heartableId} />
      </div>
    )
  },

  renderTags: function(tags) {
    tags = tags || [];

    return tags.map(function(tag) {
      return (
        <a className="fs1 caps gray-2 mr2 pointer" href={tag.url} key={'post-tag-' + tag.name}>
          #{tag.name}
        </a>
      )
    });
  },

  showModal: function(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      return;
    }

    e.preventDefault();

    this.setState({
      modalShown: true
    });
  }
};

module.exports = ListItemMixin;
