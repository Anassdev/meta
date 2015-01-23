class Idea < ActiveRecord::Base
  include ActiveRecord::UUID
  include Kaminari::ActiveRecordModelExtension

  extend FriendlyId

  friendly_id :slug_candidates, use: :slugged

  belongs_to :user
  has_many :markings, as: :markable
  has_many :marks, through: :markings
  has_one :news_feed_item, foreign_key: 'target_id'
  has_one :product

  delegate :news_feed_item_comments, to: :news_feed_item

  validates :name, presence: true,
                   length: { minimum: 2, maximum: 255 },
                   exclusion: { in: %w(admin about script if owner core start-conversation product) }
  validates :tilting_threshold, presence: true

  before_validation :set_tilting_threshold!, on: :create

  after_commit :ensure_news_feed_item, on: :create
  after_commit :update_news_feed_item

  scope :trending, -> { where(greenlit_at: nil).order(score: :desc) }
  scope :by, -> (user) { where(user_id: user.id) }
  scope :greenlit, -> { where.not(greenlit_at: nil) }
  scope :newness, -> { order(created_at: :desc) }
  scope :with_mark,  -> (name) { joins(:marks).where(marks: { name: name }) }
  scope :with_percentile, -> (percentile) {
    all.sort_by(&:percentile).
    take(percentile * all.count/100)
  }

  HEARTBURN = 30.days  # period for 100% inflation, equivalent to half-life
  DEFAULT_TILTING_THRESHOLD = 10
  EPOCH_START = Time.new(2013, 6, 6)

  TOPIC_NAMES = [
    "Art & Design",
    "Education",
    "Entertainment & Games",
    "Family & Lifestyle",
    "Mobile",
    "Productivity & Tools",
    "SaaS",
    "Social"
  ]

  TOPIC_SLUGS = TOPIC_NAMES.map{ |name| name.downcase.gsub(/ /, "-") }

  def slug_candidates
    [
      :name,
      [:creator_username, :name],
    ]
  end

  def self.create_with_discussion(user, idea_params)
    transaction do
      idea = user.ideas.create(idea_params)
      idea.push_to_news_feed
      idea
    end
  end

  def ensure_news_feed_item
    push_to_news_feed if news_feed_item.nil?
  end

  # this is for heart emails, but I think any 'thread' should have a title
  def title
    name
  end

  # ideas will belongs_to a product soon
  def product
    nil
  end

  def comments
    news_feed_item.comments
  end

  def creator_username
    user.username
  end

  def push_to_news_feed
    NewsFeedItem.create_with_target(self)
  end

  def update_news_feed_item
    if self.news_feed_item
      self.news_feed_item.update(updated_at: Time.now)
    end
  end

  def add_marks(mark_names)
    return false unless mark_names.is_a? Array
    if mark_names.reject(&:blank?).empty?
      return self.markings.destroy_all
    else
      mark_names.each do |mark_name|
        self.add_mark(mark_name)
      end
    end
  end

  def add_mark(mark_name)
    MakeMarks.new.mark_with_name(self, mark_name)
  end

  def greenlight!
    update(greenlit_at: Time.now)
  end

  def should_greenlight?
    hearts_count >= tilting_threshold
  end

  def love
    self.news_feed_item.hearts.count
  end

  def hearted
    save_score
  end

  def unhearted
    save_score
  end

  def save_score
    lovescore = 0

    news_feed_item.hearts.where('created_at > ?', last_score_update).each do |h|
      time_since = h.created_at - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      lovescore = lovescore + multiplier
    end

    update!({
      last_score_update: DateTime.now,
      score: lovescore
    })

    greenlight! if should_greenlight?
  end

  def url_params
    [self]
  end

  def rank
    Idea.where('score > ?', score).count + 1
  end

  def percentile
    rank.to_f / Idea.count * 100.round(2)
  end

  def set_tilting_threshold!
    return unless tilting_threshold.nil?

    threshold = heart_distance_from_percentile
    previous_threshold = Idea.order(created_at: :desc)
                             .limit(1)
                             .first
                             .try(:tilting_threshold)

    if threshold < previous_threshold.to_i
      threshold = previous_threshold.to_i
    end

    threshold = DEFAULT_TILTING_THRESHOLD if threshold < DEFAULT_TILTING_THRESHOLD

    update(tilting_threshold: threshold)
  end

  # Top percentile is 0, not 100
  def heart_distance_from_percentile(goal_percentile=20)
    index = (Idea.where(greenlit_at: nil).count * goal_percentile.to_f/100).to_i

    if last_idea = Idea.order(score: :desc).limit(index == 0 ? 1 : index).last
      expected_score = last_idea.score
      time_since = Time.now - EPOCH_START
      multiplier = 2 ** (time_since.to_f / HEARTBURN.to_f)
      hearts_missing = (expected_score - score) / multiplier
      (hearts_missing + 0.999).to_i
    else
      DEFAULT_TILTING_THRESHOLD
    end
  end

  def hearts_count
    news_feed_item.hearts_count
  end
end
