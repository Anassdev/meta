module.exports = React.createClass({
  displayName: 'NewsFeedItemEvent',
  propTypes: {
    id: React.PropTypes.string
  },

  render: function() {
    return (
      <div className="_pos-relative _h6 _clearfix" id={this.props.id}>
        <div className="_pos-absolute _pos-ln3 _ht1_5 _ml3_5 _img-circle bg-white _border0_25 border-gray-6" style={{width: '1.5rem'}} />
        <div className="gray-1 _ml3_5">
          {this.props.children}
        </div>
      </div>
    );
  }
});
