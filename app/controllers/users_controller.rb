class UsersController < ApplicationController
  respond_to :html, :json

  before_action :set_user, only: [:update, :dismiss_welcome_banner]

  def show
    set_user

    @products = @user.core_products.ordered_by_trend
    @products = @products.public_products if @user != current_user

    default_filters = {
      user: 'assigned',
      state: true,
      sort: ['commented', 'awarded'].exclude?(params[:user]) && 'newest'
    }.with_indifferent_access

    filters = default_filters.merge(params.slice(:user, :state, :page))
    query = FilterWipsQuery.call(Task.all, @user, filters)
    @wips = PaginatingDecorator.new(query)

    set_empty_state if @wips.empty?

    @show_karma = current_user && current_user.staff?

    respond_with @user
  end

  def edit
    authenticate_user!
    @user = current_user.decorate
  end

  def assets
    authenticate_user!
    @show_karma = current_user && current_user.staff?
    @user = User.find_by(username: params[:id]).decorate
    @assets = @user.assembly_assets.group_by { |asset| asset.product }
  end

  def karma
    @show_karma = current_user && current_user.staff?
    @user = User.find_by(username: params[:id]).decorate
    @deeds = Karma::Kronikler.new.deeds_by_user(@user.id).reverse
    @karma_history = Karma::Kronikler.new.karma_history_by_user(@user.id)
    @karma_product_history = Karma::Kronikler.new.karma_product_history_by_user(@user.id)

    @pi_chart_data = [["Product", "Karma"]]
    @productlist = @karma_product_history[1]
    (0..@productlist.count-1).each do |i|
      @pi_chart_data.append([@productlist[i], @karma_product_history[0].last[i+1]])
    end

    @karma_product_data = [["Date"]+@karma_product_history[1]]
    @karma_product_history[0].each do |k|
      @karma_product_data.append(k)
    end

    @karma_total_history = [['Date' ,'Bounties', 'Tips', 'Invites', 'Products']]
    @karma_total_history = @karma_total_history + @karma_history

    @karma_aggregate_data = Karma::Kronikler.new.aggregate_karma_info_per_user(@user.id)

  end

  def update
    @user.update(user_params)
    respond_with @user, location: (params[:return_to] || user_path(@user))
  end

  def dismiss_welcome_banner
    @user.update(welcome_banner_dismissed_at: Time.now)

    render nothing: true, status: 204
  end

  def search
    users = User.by_partial_match(params[:query]).order(:name)
    suggestions = users.map do |user|
      { value: user.name,
        id: user.id,
        facebook: user.facebook_uid?,
        password: user.encrypted_password?,
        avatar_url: user.avatar.url(60).to_s
      }
    end

    render json: {
      suggestions: suggestions
    }
  end

  def unread
    authenticate_user!
    entries = UnreadChat.for(current_user)

    render json: entries.sort_by{|e| [-e[:count], e[:index]]}
  end

  def tracking
    url = ReadraptorTracker.new(params[:article_id], current_user.id).url

    # make request to Readraptor to mark the article as read
    ReadRaptor::ReadArticle.perform_async(url)

    render json: url
  end

  if Rails.env.development?
    def impersonate
      sign_in(:user, User.find(params[:id]))
      redirect_to (params[:return_to] || root_url)
    end
  end

protected

  def user_params
    params.require(:user).permit(
      :name,
      :username,
      :email,
      :location,
      :bio,
      :mail_preference
    )
  end

  def set_user
    if params[:id]
      @user = UserDecorator.find_by!(username: params[:id])
    elsif signed_in?
      return redirect_to user_path(current_user)
    else
      warden.authenticate!
    end
    @user = @user.decorate
  end

  def page
    [params[:page].to_i, 1].max
  end

  def viewing_self?
    signed_in? && current_user == @user
  end

  def set_empty_state
    if params[:user].blank?
      @empty_state_text = "@#{@user.username} isn't working on any bounties"
    elsif params[:user] == 'started'
      @empty_state_text = "@#{@user.username} hasn't created any bounties"
    elsif params[:user] == 'commented'
      @empty_state_text = "@#{@user.username} hasn't commented on any bounties"
    elsif params[:user] == 'awarded'
      @empty_state_text = "@#{@user.username} hasn't been awarded any bounties"
    end
  end
end
