require 'oembed'

module Libertree
  module Embedder
    # FIXME: add custom providers
    OEmbed::Providers.register(
      OEmbed::Providers::Youtube,
      OEmbed::Providers::Vimeo,
      OEmbed::Providers::Flickr,
      OEmbed::Providers::SoundCloud
    )

    Libertree::Model::Post.after_create do |post|
      self.autoembed(post.text)
    end

    def self.get(url)
      OEmbed::Providers.get(url)
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
        # matching against any link is two orders of magnitude faster
        # than comparing against a list of supported link formats
        m = line.strip.match(%r|^<a href="(http(s)?://.+)">\1</a>$|)
        if m
          url = m[1]
          cached = Libertree::Model::EmbedCache[ url: url ]
          if cached
            res << "<br/>#{cached[:object]}"
          end
        end
        res
      end
    end

    def self.extract_urls(text)
      all_keys = Regexp.union(OEmbed::Providers.urls.keys)
      text.lines.find_all {|line| line =~ all_keys}.map(&:strip)
    end

  end
end
