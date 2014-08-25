class ProductRankingSerializer < ApplicationSerializer

  attributes :url
  attributes :name, :pitch, :slug, :quality, :watchings_count, :last_activity_at

  def url
    product_path(object)
  end

end
