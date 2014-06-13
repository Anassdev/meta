# TODO: remove this in favor of the hourly digest (which can be used for both hourly and daily)
class DeliverUnreadEmailDaily
  include Sidekiq::Worker
  sidekiq_options queue: 'mailer'

  # retrieve unread email from readraptor and mark as read
  def perform(user_id)
    user = User.find(user_id)
    client = ReadRaptorClient.new
    unread_article_ids = client.undelivered_articles(user.id)
    unread_articles = ReadRaptorSerializer.deserialize(unread_article_ids)

    return if unread_articles.empty?

    unread_articles.each do |entity|
      client.get(ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(entity, :email).first, user.id).url)
    end

    DigestMailer.daily(user.id, unread_article_ids).deliver
  end
end
