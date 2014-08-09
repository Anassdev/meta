class ProfitReport < ActiveRecord::Base
  belongs_to :product, touch: true
  has_many :user_balances, class_name: User::BalanceEntry.to_s

  validates :annuity, presence: :true
  validates :coins, presence: :true
  validates :expenses, presence: :true
  validates :revenue, presence: :true

  validates :end_at, presence: :true, uniqueness: { scope: :product }

  before_validation :set_coins

  FEE = 0.10
  
  def self.grace_period
    1.month
  end

  def profit
    revenue - expenses
  end

  def earnable
    profit_post_annuity * (1 - FEE)
  end

  def payable_annuity
    [profit, annuity].min
  end

  def profit_post_annuity
    [profit - annuity, 0].max
  end

  def fee
    FEE * profit_post_annuity
  end

  def payable
    user_balances.joins(:user).where('users.is_staff is false').sum(:earnings)
  end

  def royalty
    earnable / coins.to_f
  end

  def grace_ends_at
    end_at + self.class.grace_period
  end

  # private

  def set_coins
    self.coins = TransactionLogEntry.to_month_end(end_at).where(product: product).in_user_wallets.sum(:cents)
  end
end
