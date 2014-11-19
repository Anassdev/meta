require 'spec_helper'

describe 'showing all bounties' do
  let!(:user) { User.make! }
  let!(:product) { Product.make! }
  let!(:chat_room) { ChatRoom.make!(slug: product.slug, product: product) }

  before { login_as(user, scope: :user) }

  it 'shows all bounties for a given product', js: true do
    Task.make!(title: 'Design a new logo', product: product)
    Task.make!(title: 'Add some tests', product: product)

    visit product_wips_path(product)

    expect(page).to have_text('Design a new logo')
    expect(page).to have_text('Add some tests')
  end

  it 'shows all bounties in a specific state', js: true do
    Task.make!(title: 'Design a new logo', product: product)
    Task.make!(title: 'Add some tests', product: product, closed_at: 1.hour.ago)

    visit product_wips_path(product)

    expect(page).to have_text('Design a new logo')
    expect(page).to_not have_text('Add some tests')
  end
end
