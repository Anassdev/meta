class TipMailer < ActionMailer::Base
  include ActionView::Helpers::TextHelper

  layout 'email'

  def tipped(tip_id)
    @tip = Tip.find(tip_id)
    @user = @tip.to
    mail to: @user.email_address,
         subject: "#{@tip.from.username} tipped you #{pluralize(@tip.cents / 100, 'coin')}"
  end

end
