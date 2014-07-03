namespace :emails do

  task newsletter: :environment do
    next unless Newsletter.unpublished.any?

    Newsletter.next_unpublished.publish!(if ENV['EMAIL_TEST_MODE']
      User.where(is_staff: true)
    else
      User.all
    end)
  end

  task :stale_wips => :environment do
    user = User.find_by(username: 'chrislloyd')
    ProductMailer.delay(queue: 'mailer').stale_wips(user.id)
  end

  task :stale_allocated_tasks => :environment do
    Wip::Worker.dead.each(&:abandon!)
    Wip::Worker.mia.each(&:remind!)
  end

  task :joined_team_no_work_yet => :environment do
    User.find(TeamMembership.where('created_at < ?', 1.day.ago).group(:user_id).count.keys).each do |user|
      if Task.won_by(user).empty? &&                          # no bounties won
         Event::ReviewReady.where(user_id: user.id).empty? && # no work submitted
         Wip::Worker.where(user_id: user.id).empty?           # no work started

         # we'll only send this once per user. Even though they join multiple products
         unless EmailLog.sent_to(user, :joined_team_no_work_yet).any?
           EmailLog.log_send user, :joined_team_no_work_yet do
             membership = user.team_memberships.order(created_at: :desc).first
             UserMailer.delay(queue: 'mailer').joined_team_no_work_yet membership.id
           end
         end
      end
    end
  end

  task :joined_team_no_introduction_yet => :environment do
    TeamMembership.where('created_at < ?', 1.day.ago).where(bio: nil).each do |membership|
      EmailLog.send_once(membership.user, :joined_team_no_introduction_yet) do
        UserMailer.delay.joined_team_no_introduction_yet(membership.id)
      end
    end
  end


  namespace :digests do

    task :hourly => :environment do
      recently_active_users = User.
        where(mail_preference: 'hourly').
        where('last_request_at > ?', 2.hours.ago)

      recently_active_users.each do |user|
        DeliverUnreadEmail.perform_async(user.id)
      end
    end

    task :daily => :environment do
      users = User.where(mail_preference: 'daily')
      users.each do |user|
        DeliverUnreadEmail.perform_async(user.id)
      end
    end

    task :weekly => :environment do
      # If it's Thursday and there's a newsletter to send
      next unless Date.today.thursday? && Newsletter.available.any?
      newsletter = Newsletter.available.first

      # Find people who haven't un-subscribed
      users = if ENV['EMAIL_TEST_MODE']
        User.where(is_staff: true)
      else
        User.where.not(mail_preference: 'never')
      end

      # And send them a newsletter
      newsletter.email_to_users!(users)
    end

  end
end
