module AssemblyCoin
  class GreenlightProduct < AssemblyCoin::Worker

    TOTAL_COINS_UPON_GREENLIGHT = 10_000_000

    def perform(product_id)
      product = Product.find_by(id: product_id)

      if product
        AssemblyCoin::SendBtc.perform_async(product_id)
        if not product.issued_coins
          AssemblyCoin::CreateCoin.performs_async(product_id, TOTAL_COINS_UPON_GREENLIGHT)
        end
      end

    end

  end
end
