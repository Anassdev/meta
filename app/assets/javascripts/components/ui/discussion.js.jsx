var Tile = require('./tile.js.jsx')
var NewFeedItemComments = require('../news_feed/news_feed_item_comments.js.jsx')
var IdeaLovers = require('../ideas/idea_lovers.js.jsx');
var Icon = require('./icon.js.jsx')
var Heart = require('../heart.js.jsx')

function twitterUrl(url, message) {
  return 'http://twitter.com/share?url=' +
    url +
    '&text=' +
    message +
    '&';
}

var Discussion = React.createClass({

  propTypes: {
    newsFeedItem: React.PropTypes.object.isRequired
  },

  render() {
    var item = this.props.newsFeedItem

    return (
      <Tile>
        {this.props.children}

        <div className="px4 clearfix  py1">
          <ul className="left list-reset clearfix mxn2 mb0">
            <li className="left px2 py1">
              <a href="#comments" className="gray-3 gray-2-hover bold">
                <Icon icon="comment" /> {item.comments_count}
              </a>
            </li>
            <li className="left px2 py1 bold">
              <Heart heartable_id={item.id} heartable_type="NewsFeedItem" />
            </li>
          </ul>

          <ul className="right list-reset clearfix mxn1 mb0">
            <li className="left p1">
              <a className="gray-3 gray-2-hover bold" href="#" onClick={this.handleTwitterClick}>
                <Icon icon="twitter" />
              </a>
            </li>
            <li className="left p1">
              <a className="gray-3 gray-2-hover bold" href="#" onClick={this.handleFacebookClick}><Icon icon="facebook" /></a>
            </li>
            <li className="left p1">
              <a className="gray-3 gray-2-hover bold" href={this.mailToLink()}>
                <Icon icon="envelope" />
              </a>
            </li>
          </ul>

        </div>

        <div className="border-top">
          <div className="px2 md-px4" id="comments">
            <NewsFeedItemComments commentable={true} item={item} showAllComments={true} />
          </div>
        </div>
      </Tile>
    )
  },

  handleTwitterClick(e) {
    e.preventDefault()

    window.open(
      twitterUrl(this.shareUrl(), "Check this out"),
      'twitterwindow',
      'height=450, width=550, top=' +
        ($(window).height()/2 - 225) +
        ', left=' +
        $(window).width()/2 +
        ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0'
    )
  },


  handleFacebookClick(e) {
    e.preventDefault()

    FB.ui({
      method: 'share',
      display: 'popup',
      href: this.shareUrl(),
    })
  },

  shareUrl() {
    return 'https://assembly.com' + this.props.newsFeedItem.url
  },

  mailToLink() {
    return "mailto:?subject=Check this out&body=Check out this on Assembly: " + this.shareUrl()
  }

})

module.exports = window.Discussion = Discussion
