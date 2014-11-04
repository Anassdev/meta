/** @jsx React.DOM */

(function(){
  var BsModalMixin = require('../mixins/bs_modal_mixin.js.jsx')
  var FormMixin = require('../mixins/form_mixin.js.jsx')

  var AddDomain = React.createClass({
    getInitialState: function() {
      return {
        modal: null
      }
    },

    render: function() {
      return <div>
        <button className="btn btn-default btn-xs dropdown-toggle" type="button" data-toggle="dropdown">
          Add domain
          <span className="caret"></span>
        </button>
        <ul className="dropdown-menu">
          <li>
            <a href="javascript:;" onClick={this.handleTransferClicked}>Transfer a domain you own</a>
          </li>
          <li>
            <a href="javascript:;" onClick={this.handlePurchaseClicked}>Apply for a domain purchase</a>
          </li>
        </ul>

        <NewDomainTransfer ref="transfer"
          url={this.props.domains_url}
          onCancel={this.handleTransferHide}
          show={false}
          header="Transfer an existing domain" />
      </div>
    },

    handleTransferClicked: function() {
      this.refs.transfer.show()
    },

    handleShowModal: function() {
      this.refs.transfer.show()
    },

    handleTransferHide: function() {
      this.refs.transfer.hide()
    },

    handleDoingNothing: function() {
      console.log("Remember I said I'd do nothing? ...I lied!", 'danger')
    }
  })

  var NewDomainTransfer = React.createClass({
    mixins: [BsModalMixin, FormMixin],

    render: function() {
      return <div className="modal fade">
        <form onSubmit={this.handleSubmit}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                {this.renderCloseButton()}
                <strong>{this.props.header}</strong>
              </div>
              <div className="modal-body">
                <FormGroup error={this.state.errors.name}>
                  <label className="control-label">Domain name</label>
                  <input name="domain[name]" type="text" className="form-control" placeholder="example.com" autofocus />
                </FormGroup>
                <FormGroup error={this.state.errors.transfer_auth_code}>
                  <label className="control-label">Transfer Authorization Code</label>
                  <input name="domain[transfer_auth_code]" type="text" className="form-control" />
                </FormGroup>
              </div>
              <div className="modal-footer">
                <button type="button" className={'btn btn-default'} onClick={this.props.onCancel}>
                  Cancel
                </button>
                <button onClick={this.submitForm} type="submit" className={'btn btn-success'} data-disable-with="Starting...">
                  Start Transfer
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    },

    onFormSuccess: function(domain) {
      console.log(domain)
    }
  })

  if (typeof module !== 'undefined') {
    module.exports = AddDomain
  }

  window.AddDomain = AddDomain
})()

