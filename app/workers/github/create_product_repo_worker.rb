module Github
  class CreateProductRepoWorker < Github::Worker
    def perform(product_id, homepage, repo_name=nil)
      product = Product.find(product_id)
      repo_name ||= product.slug

      if ENV['GITHUB_PRODUCTS_ORG']
        repo = post "/orgs/#{ENV['GITHUB_PRODUCTS_ORG']}/repos",
          name: repo_name,
          description: product.pitch,
          homepage: homepage,
          private: false,
          has_issues: false,
          has_wiki: false,
          has_downloads: false

        add_webhooks([ENV['GITHUB_PRODUCTS_ORG'], product.slug].join('/'))
        add_license_and_readme(product, repo_name)

        product.repos |= [Repo::Github.new("https://github.com/#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}")]
        product.save!

        product.core_team.each do |user|
          if github_login = user.github_login
            Github::AddCollaboratorToProductRepoWorker.perform_async(
              repo_name,
              github_login
            )
          end
        end
      end
    end

    def add_license_and_readme(product, repo_name)
      return if commit_count("#{ENV['GITHUB_PRODUCTS_ORG']}/#{repo_name}") > 0

      url = "https://#{ENV['GITHUB_PRODUCTS_GITHUB_USER']}:#{ENV['GITHUB_PRODUCTS_GITHUB_TOKEN']}@github.com/asm-products/#{repo_name}.git"
      Dir.mktmpdir do |dir|
        Dir.chdir(dir) do
          g = Git.init(repo_name)

          g.config('user.name', ENV['GITHUB_PRODUCTS_USER_NAME'])
          g.config('user.email', ENV['GITHUB_PRODUCTS_USER_EMAIL'])
          g.config('github.user', ENV['GITHUB_PRODUCTS_GITHUB_USER'])
          g.config('github.token', ENV['GITHUB_PRODUCTS_GITHUB_TOKEN'])

          Dir.chdir(repo_name) do
            write_erb_file 'README.md', 'app/views/products/git/readme.markdown.erb', product
            write_erb_file 'LICENSE', 'app/views/products/git/license.text.erb', product

            g.add(:all=>true)
            g.commit('Initial commit')
            g.add_remote 'origin', url
            g.push
          end
        end
      end
    end

    def write_erb_file(file, view, object)
      text = ERB.new(
        File.read(Rails.root.join(view))
      ).result(SimpleDelegator.new(object).binding)
      File.write(file, text)
    end
  end
end
