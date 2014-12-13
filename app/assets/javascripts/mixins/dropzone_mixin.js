var ActionTypes               = window.CONSTANTS.ActionTypes;
var AttachmentActionCreators  = require('../actions/attachment_action_creators');
var AttachmentStore           = require('../stores/attachment_store');
var Dropzone                  = window.Dropzone;
var NewCommentActionCreators  = require('../actions/new_comment_action_creators');
var UploadingAttachmentsStore = require('../stores/uploading_attachments_store');

var DropzoneMixin = {
  initializeDropzone: function() {
    var attachmentUploadUrlTag = $('meta[name=attachment-upload-url]');
    var clickable = this.refs.clickable;

    this.dropzone = new Dropzone(this.getDOMNode(), {
      accept: this.onAccept(this.props.thread),
      clickable: clickable && clickable.getDOMNode(),
      sending: this.onSending,
      url: attachmentUploadUrlTag && attachmentUploadUrlTag.attr('content')
    });

    this.dropzone.on('complete', this.onComplete);

    AttachmentStore.addChangeListener(this.getAttachment);
    UploadingAttachmentsStore.addChangeListener(this.getUploadingAttachments);
  },

  getAttachment: function() {
    var thread = this.props.thread;
    var attachment = AttachmentStore.getAttachment(thread);

    if (attachment) {
      var currentText = this.state.text || '';
      var newText = '![' + attachment.name + '](' + attachment.href + ')\n';
      var replaceText = '![Uploading... ' + attachment.name + ']()';

      var text = currentText.replace(replaceText, newText);

      this.updateComment(thread, text);
    }
  },

  getUploadingAttachments: function() {
    var thread = this.props.thread;
    var attachments = UploadingAttachmentsStore.getUploadingAttachments(thread);

    if (attachments.length) {
      var newText = attachments.join(' ');
      var currentText = this.state.text || '';

      this.updateComment(thread, currentText + newText);
    }
  },

  onAccept: AttachmentActionCreators.uploadAttachment,
  onComplete: AttachmentActionCreators.completeAttachmentUpload,
  onSending: function(file, xhr, formData) {
    _.each(file.form, function(v, k) {
      formData.append(k, v);
    });
  },

  updateComment: function(thread, comment) {
    function sendUpdate() {
      NewCommentActionCreators.updateComment(thread, comment);
    }

    if (Dispatcher.isDispatching()) {
      return setTimeout(sendUpdate, 0);
    }

    sendUpdate();
  }
};

module.exports = DropzoneMixin;
