module Libertree
  class Markdown < Redcarpet::Render::HTML
    include Redcarpet::Render::SmartyPants
    def initialize(extensions={})
      super(extensions.merge( :filter_html => true ))
    end

    def postprocess(full_document)
      Libertree::post_processing(full_document)
    end

    def paragraph(text)
      text = Libertree::hashtaggify(text)
      text.gsub!("\n", '<br/>')
      return "<p>#{text}</p>"
    end
  end
end
