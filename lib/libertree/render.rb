module Libertree
  def self.markdownify(s)
    return ''  if s.nil?

    markdown ||= Redcarpet::Markdown.new(
      Libertree::Markdown.new( hard_wrap: true ),
      {
        autolink: true,
        space_after_headers: true,
      }
    )
    markdown.render s
  end

  def self.hashtaggify(s)
    return ''  if s.nil?

    s.gsub(/(?<=^|\s)#([a-z0-9-]+)(?=\s|\b|$)/i) {
      %|<a class="hashtag" data-hashtag="#{$1.downcase}">##{$1}</a>|
    }
  end

  def self.render(s)
    markdownify( hashtaggify(s) )
  end

  module HasRenderableText
    def text_rendered
      Libertree.render self.text
    end
  end

  module Model
    class Post
      include Libertree::HasRenderableText
    end
    class Comment
      include Libertree::HasRenderableText
    end
  end
end
