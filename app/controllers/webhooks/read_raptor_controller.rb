class Webhooks::ReadRaptorController < WebhookController

  def immediate
    user = User.find(params["user"])

    entities.each do |entity|
      # by default, readraptor will send us every unread item a user has.
      # we're going to ignore all of them except the one we're interested in
      if entity.id == params['entity_id']
        entity.notify_by_email(user)
        Rails.logger.info "readraptor_notify key=#{params["pending"]} user=#{user.username} entity=#{entity.id}"
      end
    end

    render nothing: true, status: 200
  end

  def entities
    (params["pending"] || []).map{|id| id.split('_') }.map do |type, id, tag|
      # we should ignore any tags, the main content article has no tag
      if tag.nil?
        type.constantize.find(id) rescue nil
      end
    end.compact
  end
end
