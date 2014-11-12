class AddIndexToTransactionLogEntries < ActiveRecord::Migration
  def change
    add_index :transaction_log_entries, [:wallet_id, :product_id]
  end
end
