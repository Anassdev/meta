require 'activerecord/uuid'

class Post < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension
  extend FriendlyId

  belongs_to :product
  belongs_to :author, class_name: 'User'

  has_one :news_feed_item, foreign_key: 'target_id'

  has_many :markings, as: :markable
  has_many :marks, through: :markings

  validates :product, presence: true
  validates :author,  presence: true
  validates :title,   uniqueness: true, presence: true
  validates :slug,    presence: true
  validates :summary, length: { minimum: 2, maximum: 140 }, allow_blank: true

  after_commit :push_to_news_feed, on: :create
  after_commit :mark_as_discussion, on: :create
  after_commit :update_news_feed_item

  friendly_id :title, use: :slugged

  DISCUSSION_MARK = Mark.find_or_create_by!(name: 'discussion')

  def summary
    super || body.split("\n").first
  end

  def follower_ids
    product.follower_ids
  end

  def flagged?
    flagged_at.present?
  end

  def mark_as_discussion
    Marking.create!(markable: self, mark: DISCUSSION_MARK)
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def user
    author
  end

  def update_news_feed_item
    if self.news_feed_item
      self.news_feed_item.update(updated_at: Time.now)
    end
  end

end
