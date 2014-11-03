class User::W8Ben < User::TaxInfo
  belongs_to :user

  validates :full_name, presence: true

  INTERNATIONAL_WITHHOLDING = 0.37

  def slug
    'w8ben'
  end

  def withholding
    INTERNATIONAL_WITHHOLDING
  end
end
