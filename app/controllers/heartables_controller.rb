class HeartablesController < ApplicationController
  before_action :authenticate_user!

  def love
    p = heart_params
    @heart = Heart.create(
      heartable_type: p[:type],
      heartable_id: p[:id],
      user: current_user
    )
    if @heart.valid?
      render json: {
        heartable_id: @heart.heartable_id,
        heartable_type: @heart.heartable_type,
        hearts: @heart.heartable.hearts_count
      }
    else
      render status: :unprocessable_entity, json: @heart.errors
    end
  end

  def unlove
    @heart = Heart.find_by(heartable_id: heart_params[:id], user: current_user)
    if @heart
      @heart.destroy
      render json: {
        heartable_id: @heart.heartable_id,
        heartable_type: @heart.heartable_type,
        hearts: @heart.heartable.hearts_count
      }
    else
      render status: 404, json: {"error" => "not found"}
    end
  end

  # private

  def heart_params
    params.permit(:type, :id)
  end
end
