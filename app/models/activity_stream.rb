# TODO: This is only used to render chat. Deprecate this when chat doesn't rely on activities
class ActivityStream
  include Enumerable

  KEY_PREFIX = 'activitystream'
  DEFAULT_PAGE_LENGTH = 50
  PUSH_TO_META = [Activities::FoundProduct, Activities::Launch]

  def self.serialize(activity)
    activity.id.to_s
  end

  def self.deserialize(*strs)
    Activity.where(id: strs).includes(:actor, :subject, :target, :tips)
  end

  def self.delete_all
    keys = $redis.keys("#{KEY_PREFIX}:*")
    $redis.del(*keys) if keys.any?
  end

  def initialize(id)
    @id = id
  end

  def each
    values.each { |v| yield(v) }
  end

  def push(activity)
    redis_push(key, activity)
    pusher_push(channel, activity)

    if PUSH_TO_META.include?(activity.class)
      redis_push(meta_key, activity)
      pusher_push(meta_channel, activity)
    end

    activity
  end

  def redis_push(key, activity)
    $redis.zadd(
      key,
      activity.created_at.to_i,
      self.class.serialize(activity)
    )
  end

  def pusher_push(channel, activity)
    PusherWorker.perform_async(
      channel,
      "add",
      { id: activity.id },
      socket_id: activity.socket_id
    )
  end

  def values
    range(0, -1)
  end

  def range(start_index, end_index)
    ids = $redis.zrevrange(key, start_index, end_index)
    if ids.present?
      self.class.deserialize(ids).sort_by(&:created_at)
    else
      []
    end
  end

  def page(last_id=nil, limit = DEFAULT_PAGE_LENGTH)
    offset = if last_id.nil?
      0
    else
      $redis.zrevrank(key, last_id) + 1
    end
    range(offset, offset + limit - 1)
  end

# private

  def key
    [KEY_PREFIX, 'chat_room', @id].join(':')
  end

  def channel
    [KEY_PREFIX, @id].join('.')
  end

  def meta_key
    if meta
      [KEY_PREFIX, meta.class.name.underscore, meta.id].join(':')
    end
  end

  def meta_channel
    if meta
      [KEY_PREFIX, meta.id].join('.')
    end
  end

  def meta
    Product.select('id').find_by(slug: 'meta')
  end

end
