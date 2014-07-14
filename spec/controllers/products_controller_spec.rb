require 'spec_helper'

describe ProductsController do
  render_views

  let(:creator) { User.make! }
  let(:product) { Product.make!(user: creator) }

  describe '#new' do
    it "redirects on signed out" do
      get :new
      expect(response).to redirect_to(new_user_session_path)
    end

    it "is successful when signed in" do
      sign_in creator
      get :new
      expect(response).to be_success
    end
  end

  describe '#show' do
    context 'product is launched' do
      it "is successful" do
        get :show, id: product.slug
        expect(response).to be_success
      end
    end
    context 'product in stealth' do
      let(:product) { Product.make!(launched_at: nil) }

      it "redirects to edit" do
        get :show, id: product
        expect(response).to redirect_to(edit_product_path(product))
      end
    end
  end

  describe '#edit' do
    it "is successful" do
      product.core_team << product.user
      sign_in product.user
      get :edit, id: product.slug
      expect(response).to be_success
    end
  end

  describe '#create' do
    before do
      sign_in creator
    end

    it "create's product" do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      expect(assigns(:product)).to be_a(Product)
      expect(assigns(:product)).to be_persisted
    end

    it 'should redirect to edit page' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      expect(response).to redirect_to(edit_product_path(assigns(:product)))
    end

    it 'has no slug' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      expect(assigns(:product).slug).to be_nil
    end

    it 'auto upvotes product' do
      expect {
        post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      }.to change(Vote, :count).by(1)
    end

    it 'adds validated transaction entry for product' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }

      expect(TransactionLogEntry.validated.count).to eq(1)
    end

    it 'creates a main discussion thread' do
      expect {
        post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      }.to change(Discussion, :count).by(1)

      expect(assigns(:product).main_thread).to be_persisted
    end
  end

  describe '#update' do
    before do
      sign_in creator
    end

    it 'updates all fields' do
      info_fields = Product::INFO_FIELDS.each_with_object({}) do |field, h|
        h[field.to_sym] = field
      end

      attrs = {
        name: 'KJDB',
        pitch: 'Manage your karaoke life',
        description: 'it is good.'
      }.merge(info_fields)

      patch :update, id: product, product: attrs
      expect(product.reload).to have_attributes(attrs)
    end
  end

  describe '#launch' do
    let(:product) { Product.make!(launched_at: nil, user: creator) }

    before do
      sign_in creator
    end

    it "redirects to product slug" do
      patch :launch, product_id: product
      expect(response).to redirect_to(product_path(product.reload.slug))
    end

    it 'publishes activity' do
      expect {
        patch :launch, product_id: product
      }.to change(Activity, :count).by(1)
    end

    it 'sets product to launched' do
      expect {
        patch :launch, product_id: product
      }.to change{product.reload.launched_at.to_i}.to(Time.now.to_i)
    end
  end
end
