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

    # replaces a url with an object iff
    # - it is on its own line
    # - there are no leading spaces
    # - a cached embed object exists
    def self.replace_urls_with_objects(text)
      text.lines.reduce("") do |res,line|
        res << line
        # Matching against any link is two orders of magnitude faster
        # than comparing against a list of supported link formats.
        # Note that we cannot fetch the URL after "href=" as it may have
        # been modified by the URL resolver.
        m = line.strip.match(%r|^<p><a href=".+">(http(s)?://.+)</a></p>$|)
        if m
          url = m[1]
          cached = (
            Libertree::Model::EmbedCache[ url: url ] ||
            Libertree::Model::EmbedCache[ url: url.gsub('&amp;', '&') ]
          )
          if cached
            res << "<br/>#{cached[:object]}"
          end
        end
        res
      end
    end

    def self.extract_urls(text)
      all_keys = Regexp.union(
        OEmbed::Providers.urls.keys.concat Libertree::Embedding::CustomProviders.urls.keys
      )
      text.lines.find_all {|line| line =~ all_keys}.map(&:strip)
    end

  end
end
