require 'spec_helper'

describe Users::ChatRoomsController do
  let(:product) { Product.make! }
  let(:product2) { Product.make! }
  let(:user) { User.make!(recent_product_ids: [product.id, product2.id]) }

  describe '#index' do
    before do
      sign_in user
      Watching.subscribe!(user, product)
      Watching.watch!(user, product2)
    end

    it 'only returns subscribed products' do
      get :index

      body = JSON.parse(response.body)
      expect(body["chat_rooms"].count).to eq(1)
      expect(body["chat_rooms"].first["id"]).to eq('chat_' + product.id)
    end
  end
end
