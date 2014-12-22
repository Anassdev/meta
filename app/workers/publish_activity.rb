class PublishActivity
  include Sidekiq::Worker

  attr_accessor :activity

  def perform(activity_id, socket_id)
    @activity = Activity.find(activity_id)

    story = create_story!
    push_to_feeds!(story, socket_id)
    register_with_readraptor!(story)
  end

  def create_story!
    activity.with_lock do
      Story.create!(
        verb: activity.verb,
        subject_type: activity.verb_subject
      ).tap do |story|
        activity.update_attributes story_id: story.id
      end
    end
  end

  def push_to_feeds!(story, socket_id)
    story.reader_ids.each do |user_id|
      NewsFeed.new(User, user_id).push(story)
      PusherWorker.perform_async(
        "user.#{user_id}",
        "story-added",
        story.id,
        socket_id: socket_id
      )
    end
  end

  def register_with_readraptor!(story)
    ReadRaptor::RegisterArticleWorker.perform_async(
      key: ReadRaptorSerializer.serialize_entity('Story', story.id),
      recipients: story.reader_ids
    )
  end
end
