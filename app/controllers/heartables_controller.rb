class HeartablesController < ApplicationController
  before_action :authenticate_user!

  def index

  end

  def love
    p = heart_params
    heartable = p[:type].constantize.find(p[:id])

    @heart = heartable.hearts.create(user: current_user)
    if @heart.valid?
      TrackEngagement.perform_async(
        current_user.id,
        @heart.created_at.to_i,
        'Heart',
        @heart.heartable.try(:target).try(:class).try(:name) || @heart.heartable_type,
        @heart.product.try(:id)
      )

      render json: {
        heartable_id: @heart.heartable_id,
        heartable_type: @heart.heartable_type,
        hearts_count: @heart.heartable.hearts_count
      }
    else
      render status: :unprocessable_entity, json: @heart.errors
    end
  end

  def unlove
    @heart = Heart.find_by(heartable_id: heart_params[:id], user: current_user)
    if @heart
      @heart.heartable.unhearted if @heart.destroy
      render json: {
        heartable_id: @heart.heartable_id,
        heartable_type: @heart.heartable_type,
        hearts_count: @heart.heartable.hearts_count
      }
    else
      render status: 404, json: {"error" => "not found"}
    end
  end

  def hearts
    @user_hearts = []
    if signed_in?
      @user_hearts = Heart.where(heartable_id: params[:heartable_ids]).
                           where(user_id: current_user.id)
    end

    @hearts = Heart.includes(:user).
                    where(heartable_id: params[:heartable_ids]).
                    select('distinct on (heartable_id) *')

    render json: {
      user_hearts: ActiveModel::ArraySerializer.new(@user_hearts),
      recent_hearts: ActiveModel::ArraySerializer.new(@hearts)
    }
  end

  # private

  def heart_params
    params.permit(:type, :id)
  end
end
