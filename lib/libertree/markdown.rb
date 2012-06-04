module Libertree
  class Markdown < Redcarpet::Render::HTML
    include Redcarpet::Render::SmartyPants
    def initialize(extensions={})
      super(extensions.merge( :hard_wrap => true, :filter_html => true ))
    end

    def postprocess(full_document)
      Libertree::post_processing(full_document)
    end

    def paragraph(text)
      text = Libertree::hashtaggify(text)
      return "<p>#{text}</p>"
    end
  end
end
