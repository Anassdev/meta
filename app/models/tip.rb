class Tip < ActiveRecord::Base
  belongs_to :product
  belongs_to :from, class_name: 'User'
  belongs_to :to,   class_name: 'User'
  belongs_to :via,  touch: true, polymorphic: true
  has_one :deeds, as: :karma_event

  def self.perform!(product, from, via, add_cents)
    to = via.tip_receiver
    created_at = Time.now

    tip = Tip.find_or_initialize_by(product: product, from: from, to: to, via: via)
    tip.cents ||= 0

    tip.with_lock do
      TransactionLogEntry.transfer!(product, from.id, to.id, add_cents, via.id, created_at)

      tip.cents += add_cents
      tip.save!
    end

    karma_value = 1
    if not to.nil?
      chronicle_id = Chronicle.where(user_id: to.id)
    else
      chronicle = Chronicle.create(user_id: to.id)
      chronicle_id = chronicle.id
    end

    Deed.create!({karma_value: karma_value, karma_event: tip, user_id: to.id, chronicle_id: chronicle_id})


    tip
  end
end
