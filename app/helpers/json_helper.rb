module JsonHelper
  def json(model, options={})
    hash = model.active_model_serializer.new(model, options).as_json
    # turns out pretty generate isn't all that safe...
    # if Rails.env.development?
    #   JSON.pretty_generate(hash).html_safe
    # else
      hash.to_json.html_safe
    # end
  end
end