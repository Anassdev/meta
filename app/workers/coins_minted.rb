class CoinsMinted
  include Sidekiq::Worker
  sidekiq_options queue: 'critical'

  attr_reader :entry, :product, :work

  def perform(minted_entry_id)
    @entry = TransactionLogEntry.find(minted_entry_id)
    @product = @entry.product
    @work = Wip.find_by!(id: @entry.work_id) # TODO or Product
    @winner = work.winner

    return if @winner.nil? # older wips may not have a winner if they were awarded, but re-opened

    transfer_coins_to_user_wallets!
    @product.update_partners_count_cache
    @product.save!
  end

  def transfer_coins_to_user_wallets!
    entry.with_lock do
      entry_balance = entry.cents
      tip_entries = work.contracts.tip_contracts.each do |contract|
        tip = contract.percentage * entry.cents
        entry_balance -= tip

        TransactionLogEntry.transfer!(product,
            from = work.id,
              to = contract.user.id,
           cents = tip,
             via = entry.id
         )
      end

      TransactionLogEntry.transfer!(product,
          from = work.id,
            to = work.winner.id,
         cents = entry_balance,
           via = entry.id
       )
    end
  end
end
