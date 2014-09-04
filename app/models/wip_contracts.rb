class WipContracts
  attr_reader :product, :task

  def initialize(task, auto_tip_contracts=nil)
    @task = task
    @product = task.product
    @auto_tip_contracts = auto_tip_contracts
  end

  def total_cents
    @total_cents ||= task.value
  end

  def earnable_cents
    total_cents - tip_cents
  end

  def tip_contracts
    ([author_contract] + auto_tip_contracts).compact
  end

  def author_contract
    TipContract.new(percentage: task.author_tip, user: task.user) if task.author_tip > 0
  end

  def auto_tip_contracts
    @auto_tip_contracts ||= product.auto_tip_contracts.active
  end

  def product_contracts
    @product_contracts ||= (auto_tip_contracts - core_team_contracts)
  end

  def tip_cents
    @tip_cents ||= tip_contracts.map{|c| c.percentage * total_cents }.reduce(:+)
  end

  def tip_percentage
    @tip_percentage ||= tip_contracts.map{|c| c.percentage }.reduce(:+)
  end

  def core_team_contracts
    @core_team_contracts ||= auto_tip_contracts.select{|c| product.core_team.include? c.user }
  end

  def as_json
    h = {
      total: total_cents,
      earnable: earnable_cents,
      core_team: {
        percentage: core_team_contracts.map(&:amount).sum.to_f
      },
      others: product_contracts.map{|c| {
        username: c.user.username,
        percentage: c.percentage.to_f
      }}
    }

    if task.author_tip > 0
      h[:author] = {
        username: task.user.username,
        percentage: task.author_tip.to_f
      }
    end
    h
  end
end
