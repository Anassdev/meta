require 'spec_helper'

describe TasksController do
  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wip) { Task.make!(user: user, product: product) }

  describe '#copy_deliverables' do
    before do
      sign_in user
      wip

      post :copy_deliverables,
        product_id: product.slug,
        wip_id: wip.number, copy_deliverable: { body: 'howdy stranger!' }
    end

    it "creates copy_deliverable" do
      wip.copy_deliverables.last.body.should == 'howdy stranger!'
    end
  end

  describe '#code_deliverables' do
    before do
      sign_in user
      wip
      product.repos = [Repo::Github.new('https://github.com/asm-helpful/helpful-web')]
      product.save!

      post :code_deliverables,
        product_id: product.slug,
        wip_id: wip.number, code_deliverable: { url: 'https://github.com/asm-helpful/helpful-web/pull/91' }
    end

    it "creates code_deliverable" do
      wip.code_deliverables.last.url.should == 'https://github.com/asm-helpful/helpful-web/pull/91'
    end
  end

  describe '#create' do
    it 'creates an initial offer' do
      sign_in user
      post :create, product_id: product.slug,
        task: { title: 'Add cats'},
        description: "There aren't enough",
        offer: "2690.01"

      expect(
        assigns(:offer).attributes['amount']
      ).to eq(2690)
    end

    context 'with project_id' do
      let(:project) { Milestone.make!(product: product) }

      it 'adds to project' do
        sign_in user
        project.set_number_from_wip
        project.save!

        post :create, product_id: product.slug, project_id: project.wip.number,
          task: { title: 'Add cats' }

        expect(project.reload.tasks.size).to eq(1)
      end
    end
  end
end
