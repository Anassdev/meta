class Award < ActiveRecord::Base
  belongs_to :awarder, class_name: 'User'
  belongs_to :winner, class_name: 'User'
  belongs_to :event
  belongs_to :wip

  after_commit -> { AdjustMarkings.perform_async(self.winner.id, self.wip.id, "Wip", 1.0) }, on: :create
end
