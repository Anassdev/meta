# whatupdave cribbed this from: https://github.com/mtrpcic/js-routes

desc "Generate a JavaScript file that contains your Rails routes"
namespace :js do
  task :routes, [:filename] => :environment do |t, args|
    filename = args[:filename].blank? ? "routes.js" : args[:filename]
    save_path = "#{Rails.root}/app/assets/javascripts/#{filename}"

    javascript = <<-EOS
// This is a generated file, to regen run:
// rake js:routes

var exports = module.exports = {};
    EOS

    routes.each do |route|
      javascript << generate_method(route[:name], route[:path]) + "\n"
    end

    File.open(save_path, "w") { |f| f.write(javascript) }
    puts "Routes saved to #{save_path}."
  end
end

def generate_method(name, path)
  compare = /:(.*?)(\/|$)/
  path.sub!(compare, "' + params.#{$1} + '#{$2}") while path =~ compare

  <<-EOS
exports.#{name}_path = function(options){
  if (options && options.data) {
    var op_params = []
    for(var key in options.data){
      op_params.push([key, options.data[key]].join('='));
    }
    var params = options.params;
    return '#{path}?' + op_params.join('&');
  } else if(options && options.params) {
    var params = options.params;
    return '#{path}'
  } else {
    var params = options;
    return '#{path}'
  }
}
EOS
end

ROUTES = [
  'award_product_wip',
  'discover',
  'discussion_comment',
  'discussion_comments',
  'edit_product',
  'heartables_lovers',
  'idea_mark',
  'idea',
  'ideas',
  'new_idea',
  'new_product_asset',
  'new_product_post',
  'new_product_wip',
  'new_user_session',
  'notifications',
  'product_assets',
  'product_chat',
  'product_financials',
  'product_follow',
  'product_people',
  'product_person',
  'product_post',
  'product_posts',
  'product_repos',
  'product_screenshots',
  'product_tips',
  'product_unfollow',
  'product_update_subscribe',
  'product_update_unsubscribe',
  'product_update',
  'product_wip_close',
  'product_wip_reopen',
  'product_wips',
  'product',
  'readraptor',
  'user'
]

def routes
  Rails.application.reload_routes!
  Rails.application.routes.routes.map do |route|
    if ROUTES.include?(route.name)
      path = route.path.spec.to_s.split("(")[0]
      puts "#{route.name.rjust(40)}   #{path}"
      {name: route.name, path: path}
    end

  end.compact
end
