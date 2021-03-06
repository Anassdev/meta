'use strict';

let SvgIcon = React.createClass({
  propTypes: {
    type: React.PropTypes.string.isRequired
  },

  render: function() {
    let classes, fill;

    switch(this.props.type) {
      case 'comment':
        classes = 'svg-icon svg-icon-comment',
        fill = 'M23.5,4h-15c-4.7,0-8.5,3.6-8.5,8.5c0,4.9,3.8,8.5,8.5,8.5h0.2l0.7,8.3l7.7-8.3h6.4c4.7,0,8.5-3.6,8.5-8.5C32,7.6,28.2,4,23.5,4z'
        break
      case 'share':
        classes = 'svg-icon svg-icon-share',
        fill = 'M11.5,8.1L14,5.6v16.5c0,0.8,0.7,1.4,1.5,1.4c0.8,0,1.5-0.6,1.5-1.4V5.5l2.5,2.6c0.5,0.6,1.4,0.6,2,0C22,7.5,22,6.6,21.5,6l-4.9-5.4c-0.5-0.6-1.4-0.6-2,0L9.6,6C9.1,6.6,9,7.5,9.6,8.1C10.1,8.7,11,8.7,11.5,8.1z M24.2,12H19v3h3.8c0.8,0,1.2,0.4,1.2,1.2v11.3c0,0.8-0.4,1.6-1.2,1.6H8.7C7.9,29,7,28.2,7,27.4V16.2C7,15.4,7.9,15,8.7,15H12v-3H7.3C5.7,12,4,13.2,4,14.7v14.1C4,30.4,5.7,32,7.3,32h16.9c1.6,0,2.8-1.6,2.8-3.2V14.7C27,13.2,25.8,12,24.2,12z'
        break
      case 'heart':
        classes = 'svg-icon svg-icon-heart',
        fill = 'M5.8,18.5c-1.5-1.5-2.6-3.1-3.3-4.7c-0.6-1.6-0.8-3-0.6-4.3c0.2-1.3,0.8-2.4,1.8-3.4C5.2,4.6,6.9,3.9,9,3.9c3.2,0,5.6,1.7,7,3c1.4-1.3,3.9-3.1,7-3.1c2,0,3.7,0.7,5.2,2.2c1,1,1.6,2.1,1.8,3.4c0.2,1.3,0,2.7-0.6,4.3c-0.6,1.6-1.7,3.2-3.3,4.7L16,28.9L5.8,18.5z'
        break
      case 'huge-heart':
        classes = 'svg-icon svg-icon-huge-heart',
        fill = 'M5.8,18.5c-1.5-1.5-2.6-3.1-3.3-4.7c-0.6-1.6-0.8-3-0.6-4.3c0.2-1.3,0.8-2.4,1.8-3.4C5.2,4.6,6.9,3.9,9,3.9c3.2,0,5.6,1.7,7,3c1.4-1.3,3.9-3.1,7-3.1c2,0,3.7,0.7,5.2,2.2c1,1,1.6,2.1,1.8,3.4c0.2,1.3,0,2.7-0.6,4.3c-0.6,1.6-1.7,3.2-3.3,4.7L16,28.9L5.8,18.5z'
        break
    }

    let stroke;
    switch(this.props.type) {
      case 'heart':
        stroke = 'M23,5.6c1.6,0,2.8,0.5,4,1.7c0.7,0.7,1.1,1.5,1.3,2.5c0.2,1,0,2.1-0.5,3.3c-0.6,1.4-1.5,2.8-2.9,4.1L16,26.4l-8.9-9.1c-1.4-1.4-2.3-2.8-2.9-4.1c-0.5-1.2-0.7-2.4-0.5-3.3C3.9,8.9,4.3,8,5,7.3C6.1,6.2,7.4,5.7,9,5.7c4.3,0,7,3.9,7,3.9S18.8,5.6,23,5.6M23,2.1c-2.9,0-5.3,1.2-7,2.5c-1.7-1.3-4.1-2.5-7-2.5c-2.5,0-4.7,0.9-6.4,2.7c-1.2,1.2-2,2.7-2.3,4.3c-0.3,1.6-0.1,3.4,0.7,5.3c0.7,1.8,1.9,3.6,3.6,5.3l8.9,9.1l2.5,2.5l2.5-2.5l8.9-9.1c1.7-1.7,2.9-3.5,3.6-5.3c0.8-1.9,1-3.6,0.7-5.3c-0.3-1.6-1.1-3.1-2.3-4.3C27.7,3.1,25.5,2.1,23,2.1L23,2.1z'
        break
    }
    return (
      <svg className={classes} viewBox="0 0 32 32">
        <g>
          <path className="path1" d={fill}></path>
          <path className="path2" d={stroke}></path>
        </g>
      </svg>
    )
  }
});

module.exports = SvgIcon;
