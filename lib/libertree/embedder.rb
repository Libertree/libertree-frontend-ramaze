require 'oembed'

module Libertree
  module Embedder
    # FIXME: same as in libertree-backend-rb
    OEmbed::Providers.register *[ OEmbed::Providers::Youtube,
                                  OEmbed::Providers::Vimeo,
                                  OEmbed::Providers::Flickr,
                                  OEmbed::Providers::SoundCloud ]

    Libertree::Model::Post.after_create do |post|
      self.autoembed(post.text)
    end

    def self.get(url)
      OEmbed::Providers.get(url)
    end

    def self.autoembed(text)
      urls = extract_urls(text)
      urls.each do |url|
        provider = OEmbed::Providers.find(url)
        if provider
          Libertree::Model::Job.create(
            task: 'http:embed',
            params: {
              'url' => url
            }.to_json
          )
        end
      end
    end

    # replaces a url with an object iff
    # - it is on its own line
    # - there are no leading spaces
    # - a cached embed object exists
    def self.replace_urls_with_objects(text)
      text.lines.reduce("") do |res,line|
        res << line
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
      text.lines.reduce([]) do |list,line|
        line.strip!
        # FIXME: match against OEmbed::Providers.urls.keys instead?
        list << line if line =~ %r|^http(s)?://.+|
        list
      end
    end

  end
end
