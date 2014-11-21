class NewsFeedItemCommentsController < ProductController
  include MarkdownHelper

  before_action :find_product!
  before_action :set_news_feed_item!
  before_action :authenticate_user!, only: [:create]

  respond_to :json

  def create
    @item = @news_feed_item.news_feed_item_comments.create(
      user: current_user,
      body: params[:body]
    )

    forward_comment

    respond_with @item, location: product_updates_url(@product)
  end

  def index
    comments = ActiveModel::ArraySerializer.new(
      @news_feed_item.news_feed_item_comments,
      each_serializer: NewsFeedItemCommentSerializer
    )

    respond_with comments, location: product_url(@product)
  end

  def forward_comment
    if target = @news_feed_item.target
      if !target.is_a? Wip
        Activities::NewsFeedItemComment.publish!(
          actor: @item.user,
          subject: @item,
          target: @item
        )
      else
        event = Event.create_from_comment(
          target,
          Event::Comment,
          @item.body,
          current_user
        )

        Activities::Comment.publish!(
          actor: event.user,
          subject: event,
          target: target
        )
      end
    end
  end

  def set_news_feed_item!
    @news_feed_item = NewsFeedItem.find(params[:update_id])
  end
end
