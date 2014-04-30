require 'core_ext/time_ext'

class ReadRaptorDelivery
  include Rails.application.routes.url_helpers

  attr_reader :recipients

  def initialize(recipients)
    @recipients = recipients
  end

  def deliver_async(entity)
    return unless ENV['READRAPTOR_URL']

    recipients.group_by{|u| u.mail_preference }.each do |preference, recipients|
      opts = {
        key: "#{entity.class}_#{entity.id}",
        recipients: recipients.map(&:id)
      }

      if callback = callbacks[preference]
        opts[:via] = [{
          type: 'webhook',
          at: callback[:at],
          url: callback[:url]
        }]
      end

      ReadRaptor::RegisterArticleWorker.perform_async(opts)
    end
  end

  def callbacks
    {
      'immediate' => {
        at: 30.seconds.from_now.to_i,
        url: webhooks_readraptor_immediate_url,
      },
    }
  end
end
