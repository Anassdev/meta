class StorySerializer < ApplicationSerializer
  include ActionView::Helpers::TextHelper

  attributes :actor_ids, :verb, :subject_type, :body_preview, :url, :product, :key

  has_many :activities, serializer: ActivitySerializer

  def actor_ids
    object.activities.map(&:actor_id)
  end

  def url
    story_path(object)
  end

  def body_preview
    if preview = object.body_preview
      preview.truncate(250).gsub(/\s+\r|\n\s+/, ' ').strip
    end
  end

  def product
    object.activities.first.target.product
  end

  def updated
    object.updated_at.try(:to_i)
  end

  def key
    "Story_#{object.id}"
  end
end
