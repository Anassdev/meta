class Event::CommentSerializer < EventSerializer
  include CoinHelper
  include TippableSerializer

  def anchor
    "comment-#{object.number}"
  end

  attributes :total_tips, :formatted_total_tips, :tips

  def formatted_total_tips
    object.total_tips / 100
  end

  attributes :tip_path

  def tip_path
    if object.id # This check is crazy, it's only if fake events get pushed into the stream (like maeby's first comment)
      product_tips_path(object.product, object.id)
    end
  end

end
