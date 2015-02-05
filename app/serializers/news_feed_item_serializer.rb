class NewsFeedItemSerializer < ApplicationSerializer
  attributes :url, :archived_at, :popular_at, :layout, :comments_count

  attributes :heartable_type, :hearts_count

  has_one :product, serializer: ProductShallowSerializer
  has_one :target
  has_one :user
  has_one :last_comment

  def target
    object.target_type == 'Wip' ? object.target_task : object.target
  end

  def layout
    object.target_type
  end

  def url
    if object.product?
      product_update_path(product.slug, object)
    else
      idea_path(object)
    end
  end

  def user
    object.source
  end

  def heartable_type
    'NewsFeedItem'
  end

  cached

  def cache_key
    object
  end
end
