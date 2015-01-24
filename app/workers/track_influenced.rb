class TrackInfluenced
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  EVENT_NAME = (ENV['METRIC_INFLUENCED'] || 'influenced.v3')

  def perform(user_id, timestamp, verb, verb_subject, product_id)
    user = User.find(user_id)

    props = {
      verb: verb,
      verb_subject: verb_subject,
      verb_and_subject: "#{verb}.#{verb_subject}",
    }

    if product_id
      product = Product.find(product_id)
      props[:product_id] = product.id
      props[:product_slug] = product.slug
    end

    Analytics.track(
      user_id: user.id,
      event: EVENT_NAME,
      timestamp: Time.at(timestamp),
      properties: props
    )
  end
end
