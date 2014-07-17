class UserSerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :url, :username, :avatar_url, :last_online, :bio

  def url
    user_path(object)
  end

  def avatar_url
    object.avatar.url(140).to_s
  end

  def last_online
    object.last_request_at.iso8601 if object.last_request_at?
  end
end
