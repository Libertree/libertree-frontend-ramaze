# encoding: utf-8
require 'net/http'

module Libertree
  def self.markdownify(s)
    return ''  if s.nil? or s.empty?

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
    return ''  if s.nil? or s.empty?

    s.force_encoding('utf-8').gsub(/(?<=^|\s)#([\p{Word}\p{Pd}&&[^_]]+)(?=\s|\b|$)/i) {
      %|<a class="hashtag" data-hashtag="#{$1.downcase}">##{$1}</a>|
    }
  end

  def self.post_processing(s)
    return ''  if s.nil? or s.empty?

    html = Nokogiri::HTML::fragment(s)
    html.css('a').each do |a|
      # strip javascript
      if a['href']
        a['href'] = a['href'].gsub(/javascript:/i, 'nojavascript:')
      end
      # resolve uris
      if a['href'] =~ %r{http://}
        a['href'] = resolve_redirection(a['href'])
      end
    end
    html.to_xhtml
  end

  def self.resolve_redirection( url_s )
    cached = Libertree::Model::UrlExpansion[ url_short: url_s ]
    if cached
      return cached.url_expanded
    end

    begin
      resolution = url_s
      url = URI.parse(url_s)
      res = nil
      num_redirections = 0

      timeout(3) do
        while num_redirections < 8
          if url.host && url.port
            host, port = url.host, url.port
          else
            break
          end

          req = Net::HTTP::Get.new(url.path)
          res = Net::HTTP.start(host, port) { |http|  http.request(req) }

          if res.header['location']
            url = URI.parse(res.header['location'])
            num_redirections += 1
          else
            resolution = url.to_s
            Libertree::Model::UrlExpansion.create(
              :url_short => url_s,
              :url_expanded => resolution
            )
            break
          end
        end

        resolution
      end
    rescue Timeout::Error, URI::InvalidURIError, IOError, Errno::ECONNREFUSED, Errno::ECONNRESET, Net::HTTPBadResponse, ArgumentError
      url_s
    end
  end

  def self.render(s)
    post_processing( markdownify( hashtaggify(s) ) )
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
