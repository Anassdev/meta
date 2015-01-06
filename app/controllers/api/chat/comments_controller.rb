module Api
  module Chat
    class CommentsController < ApiController
      before_action :authenticate

      def create
        body = params[:body] || params[:message] # TODO: (whatupdave) change Kernel to use body
        @chat_room = ChatRoom.includes(:wip).find_by!(slug: params[:chat_room_id])
        @chat_room.with_lock do
          @event = Event.create_from_comment(@chat_room.wip, Event::Comment, body, current_user, params[:socket_id])
        end

        if @event.valid?
          email_mentioned_users(@event)

          @activity = Activities::Chat.publish!(
            actor: current_user,
            subject: @event,
            target: @chat_room,
            socket_id: params[:socket_id]
          )

          channels = @chat_room.follower_ids.map{|user_id| "user.#{user_id}"}
          if channels.any?
            PusherWorker.perform_async(
              channels,
              "chat-added",
              { chat_room: @chat_room.id, updated: @event.created_at.to_i },
              socket_id: params[:socket_id]
            )
          end
        end

        respond_to do |format|
          format.json { render json: @activity, serializer: ActivitySerializer }
        end
      end

      def index
        @chat_room = ChatRoom.find_by!(slug: params[:chat_room_id])
        @activity_stream = ActivityStream.new(@chat_room.id).page(params[:top_id])
        respond_to do |format|
          format.json {
            render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
          }
        end
      end

      def email_mentioned_users(event)
        (event.mentioned_users - [event.user]).each do |mentioned_user|
          EmailLog.send_once mentioned_user.id, event.id do
            ChatMailer.delay(queue: 'mailer').mentioned_in_chat(mentioned_user.id, event.id)
          end
        end
      end
    end
  end
end
