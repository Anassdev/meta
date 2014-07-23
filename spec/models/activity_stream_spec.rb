require 'spec_helper'

describe NewsFeed do

  it 'returns previous stories one' do
    stream  = NewsFeed.new(owner_can_be_anthing = Product.make!)
    three = stream.push( Story.make!(created_at: 1.day.ago) )
    two  = stream.push( Story.make!(created_at: 2.day.ago) )
    one  = stream.push( Story.make!(created_at: 3.day.ago) )

    results = stream.page(no_id = nil, page_size = 2)
    results.should include(two, three)
  end

  it 'returns previous stories two' do
    stream  = NewsFeed.new(owner_can_be_anthing = Product.make!)
    three = stream.push( Story.make!(created_at: 1.day.ago) )
    two  = stream.push( Story.make!(created_at: 2.day.ago) )
    one  = stream.push( Story.make!(created_at: 3.day.ago) )

    results = stream.page(three.id, page_size = 2)
    results.should include(one, two)
  end

end
