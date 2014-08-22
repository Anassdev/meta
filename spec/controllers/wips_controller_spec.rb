require 'spec_helper'

describe TasksController do
  let(:user) { User.make! }
  let(:worker) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let!(:wips) { [Task.make!(user: user, product: product)] }
  let!(:event) { Event::Comment.make!(wip: wips.first, user: worker) }

  describe '#index' do
    before do
      sign_in user
      get :index, product_id: product.slug
    end

    it "is succesful" do
      expect(response).to be_successful
    end

    it "assigns wips" do
      expect(assigns(:wips)).to be
    end
  end

  describe '#award' do
    before do
      sign_in user
      product.team_memberships.create(user: user, is_core: true)
      patch :award, product_id: product.slug, id: wips.first.number, event_id: event.id, format: :js
    end

    it "sends awarded mail" do
      expect(
        Sidekiq::Extensions::DelayedMailer.jobs.size
      ).to eq(1)
    end
  end

  describe '#update' do
    before do
      sign_in user
      product.team_memberships.create(user: user, is_core: true)
    end

    it 'updates a wip' do
      patch :update, product_id: product.slug, id: wips.first.number, task: { title: 'Foo' }
      expect(response.status).to eq(302)
    end
  end

  describe '#tag' do
    before do
      sign_in user
    end

    it 'tags a wip' do
      patch :tag, product_id: product.slug, wip_id: wips.first.number, task: { tag_list: ['foo', 'bar', 'baz'] }
      expect(response.status).to eq(302)
      expect(assigns(:wips))
    end
  end

  describe '#mute' do
    before do
      sign_in user
      request.env["HTTP_REFERER"] = "/"
    end

    it 'creates a muting' do
      expect {
        patch :mute, product_id: product.slug, wip_id: wips.first.number, task: { title: 'Foo' }
      }.to change(Muting, :count).by(1)
    end
  end

  # effectively an un-mute
  describe '#watch' do
    let(:wip) { wips.first }

    before do
      sign_in worker
      request.env["HTTP_REFERER"] = "/"
      product.watch!(worker)
      wip.mute!(worker)
    end

    it 'unmutes a wip' do
      patch :watch, product_id: product.slug, wip_id: wip.number, task: { title: 'Foo' }
      expect(response.status).to eq(302)
      expect(assigns(:wip).followed_by?(worker)).to be_true
    end
  end
end
