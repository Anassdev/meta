'use strict';

const Icon = require('../ui/icon.js.jsx');
const Routes = require('../../routes')

let ProductImportantLinks = React.createClass({
  propTypes: {
    product: React.PropTypes.shape({
      slug: React.PropTypes.string.isRequired
    }).isRequired
  },

  render() {
    let product = this.props.product;
    let slug = product.slug;

    return (
      <div className="clearfix mxn1">
        {this.renderHomepageUrl()}

        {this.renderLink('comments', 'Chat', Routes.product_chat_path({ product_id: slug }))}

        {this.renderLink('warning', 'File a bug', Routes.product_wips_path({
              params: {
                product_id: slug
              },
              data: {
                modal: true,
                tags: 'bug'
              }
            }))}

        {this.renderLink('question-circle', 'Ask a question', Routes.product_posts_path({
            params: {
              product_id: slug
            },
            data: {
              modal: true,
              tags: 'question'
            }
        }))}

        {this.renderLink('github', 'Source code', Routes.product_repos_path({ product_id: slug }))}

        {this.renderLink('photo', 'Assets', Routes.product_assets_path({ product_id: slug }))}

        {this.renderLink('bar-chart', 'Financials', Routes.product_financials_path({product_id: slug }))}
      </div>
    );
  },

  renderLink(icon, label, url) {
    return <a className="block sm-col sm-col-6 lg-col-4 p1" href={url}>
      <span className="mr2 gray-3">
        <Icon icon={icon} />
      </span>
      {label}
    </a>
  },

  renderHomepageUrl() {
    let product = this.props.product;

    if (product.homepage_url) {
      return this.renderLink('home', 'Home', product.homepage_url)
    }
  }
});

module.exports = ProductImportantLinks;
