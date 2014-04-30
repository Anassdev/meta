class AsmMetricsWorker
  include Sidekiq::Worker

  def perform(name, value, at=Time.current)
    queue = Librato::Metrics::Queue.new(client: client)
    queue.add "#{name}" => { type: :counter, value: value, measure_time: at }
    queue.submit
  end

  def client
    @client ||= begin
      client = Librato::Metrics::Client.new
      client.authenticate 'asm', Product.find_by!(slug: 'asm').authentication_token
      client.api_endpoint = ENV['ASM_METRICS_ENDPOINT']
      client
    end
  end
end
