require 'securerandom'

module TextFilters
  class LightboxImageFilter < HTML::Pipeline::Filter

    def call
      doc.search("img").each do |img|
        img['class'] = [img['class'], 'img-responsive'].compact.join(' ')
        html = LightboxImageFilter.wrap_image_with_lightbox(img.to_html)
        img.replace(html)
      end
      doc
    end

    def self.wrap_image_with_lightbox(image_html)
      unique_element_id = ['lightbox', SecureRandom.uuid].join('-')

      <<-ENDHTML
        <div class="row">
          <div class="col-xs-12 col-sm-8 col-md-6">
            <a href="##{unique_element_id}" data-toggle="lightbox">
              #{image_html}
            </a>
          </div>
        </div>
        <div id="#{unique_element_id}" class="lightbox" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="lightbox-dialog">
            <div class="lightbox-content">
              #{image_html}
            </div>
          </div>
        </div>
      ENDHTML
    end
  end
end
