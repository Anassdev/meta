class NotifyOnlineWorker < ActiveJob::Base
  queue_as :default

  def perform(user_id)
    user = User.find(user_id)

    user.watching.each do |product|
    end

  end
end
