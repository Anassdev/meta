def SlackpipePayload
  def self.deploy!(body={})
    timestamp = Time.now.to_i
    prehash = "#{timestamp}#{body[:message].to_json}"
    secret = Base64.decode64(ENV['SLACKPIPE_SECRET'])
    hash = OpenSSL::HMAC.digest('sha256', secret, prehash)
    signature = Base64.encode64(hash)

    SlackpipeWorker.perform_async(body.merge({auth: {signature: signature, timestamp: timestamp}}))
  end
end