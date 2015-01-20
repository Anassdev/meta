class BadgeMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  layout 'email'

  def first_win(event_id)
    mailgun_campaign 'notifications'

    if @event = Event.find_by(id: event_id)
      @wip = @event.wip.decorate
    else
      @event = NewsFeedItemComment.find(event_id)
      @wip = @event.news_feed_item.target
    end

    @product = @wip.product
    @user = @event.user
    @awarder = @wip.closer || @wip.awards.last.awarder

    mail to: @user.email_address,
         subject: "Boom! You got #{pluralize @wip.value, 'coin'}."
  end

end
