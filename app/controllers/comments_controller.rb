class CommentsController < ApplicationController
  include Missions::CompletionHelper

  respond_to :html, :json

  before_action :authenticate_user!, :only => [:create]
  before_action :set_wip
  before_action :set_event, only: [:show, :edit, :update]

  def show
    respond_with @comment, location: product_wip_path(@product, @wip), serializer: EventSerializer
  end

  def create
    type = comment_params[:type].constantize
    authorize! type.slug.to_sym, @wip
    @wip.with_lock do
      @event = Event.create_from_comment(@wip, type, comment_params[:body], current_user, comment_params[:socket_id])
    end

    if @event.valid?
      if type == Event::Comment
        track_wip_engaged @wip, 'commented'
        register_with_readraptor(@event)

        @event.notify_users!(@wip.watchers)

        Activities::Comment.publish!(
          actor: @event.user,
          subject: @event,
          target: @wip,
          socket_id: params[:socket_id]
        )
      end

      track_analytics(@event)
      next_mission_if_complete!(@product.current_mission, current_user)
    end

    respond_with @event, location: product_wip_path(@product, @wip), serializer: EventSerializer
  end

  def edit
    authenticate_user!
    authorize! :update, @comment
  end

  def update
    authenticate_user!
    authorize! :update, @comment

    @comment.update_attributes(comment_params.merge(updated_by: current_user))

    respond_with @comment, location: url_for([@product, @wip]), serializer: EventSerializer
  end

  # private

  def set_wip
    @product = Product.find_by!(slug: params[:product_id]).decorate
    if params[:discussion_id]
      @wip = @product.discussions.find_by(number: params[:discussion_id])
    else
      @wip = @product.wips.find_by(number: params[:wip_id])
    end
  end

  def set_event
    @comment = params[:id].uuid? ? @wip.events.find(params[:id]) : @wip.events.find_by(number: params[:id])
  end

  def comment_params
    params.require(:event_comment).permit(:body, :type, :socket_id)
  end

  def track_analytics(event)
    track_params = EventAnalyticsSerializer.new(event, scope: current_user).as_json
    track_event event.class.analytics_name, track_params
    if !current_user.staff?
      AsmMetrics.product_enhancement
      AsmMetrics.active_user(current_user)
      AsmMetrics.active_builder(current_user)
    end
  end

  def track_wip_engaged(wip, engagement)
    track_event 'wip.engaged', WipAnalyticsSerializer.new(wip, scope: current_user).as_json.merge(engagement: 'commented')
  end

  def register_with_readraptor(event)
    excluded_users = [event.user, event.mentioned_users].flatten.compact.uniq
    ReadRaptorDelivery.new(event.wip.watchers - excluded_users).deliver_async(event)
  end
end
