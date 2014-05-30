class ChatController < ApplicationController

  respond_to :html, :json

  def index
    find_product!
    @activity_stream = ActivityStream.new(@product).page(params[:top_id])

    respond_to do |format|
      format.html do
        @watchers = @product.watchers.order(last_request_at: :desc).limit(30)
      end
      format.json do
        render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
      end
    end
  end

  def create
    find_product!
    authenticate_user!

    @product.main_thread.with_lock do
      @event = Event.create_from_comment(
        @product.main_thread,
        Event::Comment,
        params.fetch(:body),
        current_user
      )
    end

    track_wip_engaged @product.main_thread, 'commented'
    register_with_readraptor(@event)
    @event.notify_mentioned_users!

    @activity = Activities::Comment.publish!(actor: @event.user, target: @event)

    track_analytics(@event)
    next_mission_if_complete!(@product.current_mission, current_user)

    PusherWorker.perform_async(
      "activitystream.#{@product.id}",
      "add",
      ActivitySerializer.new(@activity).to_json,
      socket_id: params[:socket_id]
    )

    respond_with @activity, location: product_chat_path(@product), serializer: ActivitySerializer
  end

  private

  def find_product!
    @product = Product.find_by_slug!(params.fetch(:product_id))
  end

  def comment_params
    params.require(:comment).permit(:body)
  end

  # --

  include Missions::CompletionHelper

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
