require 'spec_helper'

describe 'log entries' do
  let(:product) { Product.make! }
  let(:creator) { product.user }
  let(:wip_creator) { User.make! }

  context 'proposed entry' do
    it 'adds when a Task is created' do
      wip = WipFactory.create(product, product.tasks, wip_creator, '0.0.0.0', title: 'Needs more majesty')

      expect(
        TransactionLogEntry.where(action: 'proposed').first
      ).to have_attributes(
          product_id: product.id,
          action: 'proposed',
          work_id: wip.id,
          wallet_id: wip_creator.id
      )
    end
  end

  context 'minted entry' do
    let(:wip) { Task.make! product: product, user: wip_creator }

    it 'adds when Task is won' do
      event = Event::Comment.new(body: 'Dagron', user: wip_creator)
      wip.events << event
      wip.award(product.user, event)

      expect(
        TransactionLogEntry.first
      ).to have_attributes(
          product_id: product.id,
          action: 'validated',
          work_id: wip.id,
          wallet_id: product.user.id,
          value: wip_creator.id
      )
    end

  end

  context 'voted entry' do
    let(:wip) { Task.make! product: product, user: wip_creator }

    it 'adds when a Task is created' do
      wip = WipFactory.create(product, product.tasks, wip_creator, '0.0.0.0', title: 'Needs more majesty')

      expect(
        TransactionLogEntry.where(action: 'voted').first
      ).to have_attributes(
          product_id: product.id,
          action: 'voted',
          work_id: wip.id,
          wallet_id: wip_creator.id,
          value: '1'
      )
    end

    it 'adds when task is upvoted' do
      wip.upvote! wip_creator, '0.0.0.0'

      expect(
        TransactionLogEntry.first
      ).to have_attributes(
          product_id: product.id,
          action: 'voted',
          work_id: wip.id,
          wallet_id: wip_creator.id
      )
    end
  end

  context 'multiplier entry' do
    let(:wip) { Task.make! product: product, user: wip_creator }

    it 'adds when task is promoted' do
      product.team_memberships.create(user: product.user, is_core: true)
      wip.multiply!(product.user, 2.0)

      expect(
        TransactionLogEntry.first
      ).to have_attributes(
          product_id: product.id,
          action: 'multiplied',
          work_id: wip.id,
          wallet_id: wip_creator.id,
          value: '2.0'
      )
    end
  end

  context 'minted entry' do
    let(:wip) { Task.make! product: product, user: wip_creator }

    it 'mints into wallet' do
      entry = TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, wip.id, wip.id, 170)

      expect(
        entry
      ).to have_attributes(
          product_id: product.id,
          action: 'minted',
          work_id: wip.id,
          wallet_id: wip.id,
          cents: 170
      )
    end
  end

  context 'transfer entries from tipping' do
    let(:wip) { Task.make! product: product, user: wip_creator }
    let(:comment) { Activity.make! }
    let(:from) { User.make! }

    it 'creates debit and credit when task is promoted' do
      TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, wip.id, from.id, 3)

      Timecop.travel(Time.now + 5)

      Tip.perform!(product, from, comment, 3)

      entries = TransactionLogEntry.order('created_at desc').take(2)
      expect(
        entries[0]
      ).to have_attributes(
          product_id: product.id,
          action: 'credit',
          work_id: comment.id,
          wallet_id: comment.actor.id,
          cents: 3
      )
      expect(
        entries[1]
      ).to have_attributes(
          product_id: product.id,
          action: 'debit',
          work_id: comment.id,
          wallet_id: from.id,
          cents: -3
      )
    end
  end
end
