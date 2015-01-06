require 'spec_helper'

describe MarkVectorFromText do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'test marking a user from text' do
      Mark.create!({name: "elrond"})
      sample_text = "elrond"
      MarkVectorFromText.new.perform(user.id, sample_text)
      pending "Test still incomplete.  Check out Interpreter and AddMarkIdentity which are downstream."
    end
  end
end
