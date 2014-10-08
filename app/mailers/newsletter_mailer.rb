class NewsletterMailer < BaseMailer

  helper :markdown

  def published(newsletter_id, user_id)
    mailgun_campaign 'newsletter'

    @newsletter = Newsletter.find(newsletter_id)
    @user = User.find(user_id)
    mail to: @user.email_address,
         from: 'Austin from Assembly <austin@assembly.com>',
         subject: @newsletter.subject
  end

end
