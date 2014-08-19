module Api
  class MailingListsController < ApplicationController
    respond_to :json
    before_filter :set_access_control_headers

    protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }

    def create
      email = params[:email]
      subscription = MailingList.create!(product_id: product_id, email: email)

      unless User.find_by(email: email)
        ProductMailer.delay(queue: 'mailer').mailing_list(product_id, email)
      end

      respond_with subscription, location: root_url
    end

    def destroy
      if subscription = MailingList.find_by(product_id: product_id, email: params[:email])
        subscription.destroy!
      end

      respond_with nil, location: root_url
    end

    def product_id
      Product.where(slug: params[:product_id]).pluck(:id).first
    end

    def set_access_control_headers
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'POST, DELETE'
      headers['Access-Control-Request-Method'] = '*'
      headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
    end
  end
end
