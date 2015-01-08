class FilterIdeasQuery
  attr_accessor :options

  def self.call(options)
    new(options).filter
  end

  def initialize(options)
    self.options = options
  end

  def clauses
    [by_user, filter_by, sort_by, with_mark].compact
  end

  def filter
    filter_and_sort(Idea.includes(:news_feed_item))
  end

  def filter_and_sort(query)
    clauses.inject(query) do |query, clause|
      query.merge(clause)
    end
  end

  def by_user
    return unless options[:user]

    Idea.by(User.find_by(username: options[:user]))
  end

  def filter_by
    return unless options[:filter]

    Idea.send(options[:filter].to_sym)
  end

  def sort_by
    case options[:sort]
    when 'newness'
      Idea.order(created_at: :desc)
    else
      Idea.order(score: :desc)
    end
  end

  def with_mark
    return unless options[:mark]

    Idea.with_mark(options[:mark])
  end
end
