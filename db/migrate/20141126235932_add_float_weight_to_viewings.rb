class AddFloatWeightToViewings < ActiveRecord::Migration
  def change
    Viewing.all.delete_all 
    add_column :viewings, :weight, :float

    add_column :top_bounties, :wip_id, :uuid
    add_column :top_products, :product_id, :uuid

  end
end
