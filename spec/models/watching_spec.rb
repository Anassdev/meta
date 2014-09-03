require 'spec_helper'

describe Watching do
  let(:user) { User.make! }
  let(:wip) { Task.make!(user: user, product: watchable) }
  let(:watchable) { Product.make! }

  describe 'watch!' do
    let!(:subscriber) { User.make! }

    it 'watches a watchable' do
      Watching.watch!(user, watchable)

      expect(watchable.followers).to include(user)
    end
  end

  describe 'unwatch!' do
    before do
      Watching.watch!(user, watchable)
    end

    it 'unwatches a watchable' do
      Watching.unwatch!(user, watchable)

      expect(watchable.followers).not_to include(user)
    end
  end

  describe 'unwatch! a product' do
    before do
      Watching.watch!(user, watchable)
      Watching.watch!(user, wip)
    end

    it 'unwatches all wips when unwatching a product' do
      Watching.unwatch!(user, watchable)

      expect(watchable.followers).not_to include(user)
      expect(wip.followers).not_to include(user)
    end
  end


  describe 'watched?' do
    let!(:non_watcher) { User.make! }

    before do
      Watching.watch!(user, watchable)
    end

    it 'returns true if watched' do
      expect(Watching.watched?(user, watchable)).to be_true
    end

    it 'returns false if unwatched' do
      expect(Watching.watched?(non_watcher, watchable)).to be_false
    end
  end
end
