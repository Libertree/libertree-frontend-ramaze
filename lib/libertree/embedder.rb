require 'oembed'
require_relative 'embedding/custom-providers'

module Libertree
  module Embedder
    OEmbed::Providers.register(
      OEmbed::Providers::Youtube,
      OEmbed::Providers::Vimeo,
      OEmbed::Providers::Flickr,
      OEmbed::Providers::SoundCloud
    )

    Libertree::Model::Post.after_create do |post|
      self.autoembed(post.text)
    end
    Libertree::Model::Post.after_update do |post|
      self.autoembed(post.text)
    end

    def self.get(url)
      Libertree::Embedding::CustomProviders.get(url) || OEmbed::Providers.get(url).html
    end

    def self.autoembed(text)
      urls = extract_urls(text)
      urls.each do |url|
        Libertree::Model::Job.create(
          task: 'http:embed',
          params: {
            'url' => url
          }.to_json
        )
      end
    end

    def self.inject_objects(rendered)
      html = Nokogiri::HTML::fragment(rendered)

      # extract every URL from a paragraph and append embed object if supported
      html.css('p').each do |p|
        urls = p.xpath(".//a/@href").map(&:value).reverse
        urls.each do |url|
          cached = (
            Libertree::Model::EmbedCache[ url: url ] ||
            Libertree::Model::EmbedCache[ url: url.gsub('&amp;', '&') ]
          )
          if cached
            p.add_next_sibling("<div class='embed'>#{cached[:object]}</div>")
          end
        end
      end
      html.to_s
    end

    def self.supported
      @supported ||= Regexp.union(
        OEmbed::Providers.urls.keys.concat Libertree::Embedding::CustomProviders.urls.keys
      )
    end

    def self.extract_urls(text)
      html = Nokogiri::HTML.fragment(Libertree.render(text))
      urls = html.xpath(".//a/@href").map(&:value)

      urls.find_all {|u| u =~ self.supported}.map(&:strip)
    end

  end
end
