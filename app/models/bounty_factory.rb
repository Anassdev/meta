class BountyFactory
  def generate_bounty(product, author, description, title, value)
    bounty = WipFactory.create(
      product,
      @product.tasks,
      author,
      nil,
      nil,
      nil
    )

    if bounty.valid?
      offer = bounty.offers.create(user: author, amount: value)
      bounty.watch!(author)

      @activity = Activities::Post.publish!(
        actor: author,
        subject: bounty,
        target: product
      )
    end
    bounty.update!({description: description, title: title})
  end
end
