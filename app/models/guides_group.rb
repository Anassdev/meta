class GuidesGroup < StaticContentGroup
  GROUPS = [
    ['platform',    'Assembly Platform'],
    ['getting-started',    'Getting Started'],
    ['building-products',    'Building Products']
  ]

  def self.all
    GROUPS.map {|g| new(*g) }
  end

  def self.base_path
    @base_path || Rails.root.join('app', 'views', 'guides_groups')
  end
end
