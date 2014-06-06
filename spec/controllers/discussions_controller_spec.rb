require 'spec_helper'

describe DiscussionsController do
  render_views

  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wip) { Discussion.make!(product: product) }

  describe '#show' do
    before do
      wip
      get :show, product_id: product.slug, id: wip.number
    end

    it "assigns wip" do
      expect(assigns(:wip))
    end
  end
end
