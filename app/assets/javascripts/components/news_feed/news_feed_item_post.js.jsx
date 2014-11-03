(function() {

  module.exports = React.createClass({
    displayName: 'NewsFeedItemPost',

    propTypes: {
      post: React.PropTypes.object.isRequired,
      user: React.PropTypes.object.isRequired,
      product: React.PropTypes.object.isRequired
    },

    render: function() {
      var post = this.props.post
      var user = this.props.user
      var product = this.props.product

      if (!post) {
        return <div />;
      }

      return (
        <div className="p3">
          <div className="left">
            <AppIcon app={this.props.product} size={42} />
          </div>
          <div className="overflow-hidden p2">
            <a href={product.url}>{product.name}</a>
            <span className="gray-dark pull-right">{this.type(post.type)}</span>
          </div>

          <a href={post.url} className="block h4 mt0 mb2 black">
            {post.title}
          </a>

          <div className="clearfix gray h6 mt0 mb2">
            <div className="left mr1">
              <Avatar user={user} size={18} />
            </div>
            <div className="overflow-hidden">
              <a className="gray" href={user.url}>{user.username}</a>
            </div>
          </div>

          <div className="gray-darker" dangerouslySetInnerHTML={{__html: (post.markdown_body || post.description)}} />
          <a className="text-small" href={post.url}>Read more</a>
        </div>
      )
    },

    type: function(type) {
      if (type === 'news_feed_item_post') {
        return 'update';
      }

      return type.replace(/_/g, '')
    }
  })

})()
