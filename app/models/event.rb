require 'activerecord/uuid'

# TODO: (whatupdave) rename this. These are wip events (comments, opens, awards etc)
class Event < ActiveRecord::Base
  include ActiveRecord::UUID
  include Versioning

  belongs_to :user
  belongs_to :wip, touch: true, counter_cache: true

  has_many :activities, as: :subject
  has_many :tips, foreign_key: 'via_id'
  has_many :tippers, through: :tips, source: :from

  after_commit -> { self.wip.event_added(self); }, on: :create

  delegate :product, :to => :wip

  acts_as_sequenced scope: :wip_id, column: :number, start_at: 1

  MAILABLE = [
    Event::Close,
    Event::Comment,
    Event::CommitReference,
    Event::Reopen,
    Event::Win
  ]

  attr_accessor :socket_id # for Pusher

  def self.analytics_name
    "wip.#{slug}"
  end

  def awardable?
    false
  end

  def tippable?
    false
  end

  def editable?
    false
  end

  def notify_by_email?
    MAILABLE.include? self.class
  end

  # this is called immediately on event created
  # this  shouldn't email anyone because readraptor will take care of that
  def notify_users!(users)
    mentioned = self.mentioned_users
    users.each do |user|
      notify_by_email(user) if mentioned.include?(user)
      update_unreads(user)
    end

    update_pusher(users, mentioned_users)
  end

  def notify_by_email(user)
    if notify_by_email? && !user.mail_never?
      WipMailer.delay.wip_event_added(user.id, self.id)
    end
  end

  def update_unreads(user)
    if self.is_a? ::Event::Comment
      wip.updates.for(user).new_comment!
    end
  end

  def update_pusher(users, mentioned_users)
    event_hash = EventSerializer.for(self, nil).as_json.merge(socket_id: self.socket_id)
    event_hash[:mentions] = mentioned_users.map(&:username)

    if wip.main_thread?
      # currently on the main thread, pusher pushes a 'chat' event to the user's channel which triggers
      # it to call for updates. This is part of notifications

      user_channels = users.map{|u| "@#{u.username}"}
      PusherWorker.perform_async user_channels, 'chat', event_hash.to_json
    else
      # on other discussions and tasks, an event is pushed on the wip channel to update the page
      # this is not covered by the notifications stuff
      PusherWorker.perform_async wip.push_channel, 'event.added', event_hash.to_json
    end
  end

  def mentioned_users
    users = []
    TextFilters::UserMentionFilter.mentioned_usernames_in(self.body) do |user, username|
      users << user
    end
    users
  end

  def total_tips
    tips.sum(:cents)
  end

  def to_param
    number
  end

  def self.slug
    name.demodulize.underscore.downcase
  end

  def self.render_events(events, current_user)
    # TODO (chrislloyd) This is a hack from the old Mustache days. It could be
    #      really cleaned up.
    events.map do |event|
      event_data = EventSerializer.for(event, current_user).as_json

      if current_user
        tracker = ReadraptorTracker.new(ReadRaptorSerializer.serialize_entities(event).first, current_user.id)
        event_data[:readraptor_tracking_url] = tracker.url
      end

      event_name = event.class.slug

      template_root = Rails.root.join('app', 'templates', 'events')
      template_path = template_root.join(
        event_name.pluralize,
        "_#{event_name}.mustache"
      )

      [event, Mustache.render(File.read(template_path), event_data)]
    end
  end

  def self.create_from_comment(wip, type, body, user, socket_id = nil)
    case type.to_s
    when Event::Close.to_s
      wip.close!(user, body)

    when Event::Reopen.to_s
      wip.reopen!(user, body)

    when Event::Promotion.to_s
      wip.promote!(user, body)

    when Event::Demotion.to_s
      wip.demote!(user, body)

    when Event::Comment.to_s
      wip.comments.create(user_id: user.id, body: body, socket_id: socket_id)

    else
      raise 'Unknown event'
    end
  end
end
