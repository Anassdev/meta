require 'spec_helper'

describe CoreTeamMembersController do

  let(:product) { Product.make! }
  let(:current_user) { User.make! }
  let(:user) { User.make! }

  describe '#index' do
    it 'is successful' do
      get :index, product_id: product.slug
      expect(response.status).to eq(302)
    end
  end

  describe "POST #create" do

    it "is successful even if user is not on team" do
      product.core_team << current_user
      sign_in(current_user)
      post :create,
        product_id: product.slug,
        core_team_member: { username: user.username }
      expect(response).to redirect_to(edit_product_path(product))
    end
  end

end
