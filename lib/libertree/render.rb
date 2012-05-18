require 'net/http'

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

  def self.urls_resolved(s)
    return ''  if s.nil?

    s.gsub(%r{href="(http://.+)"}) {
      resolution = resolve_redirection($1)
      %|href="#{resolution}"|
    }
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

  def self.strip_javascript(s)
    html = Nokogiri::HTML(s)
    html.css('a').each do |a|
      a['href'] = a['href'].gsub('javascript:', 'nojavascript:')
    end
    html.to_xhtml
  end

  def self.render(s)
    strip_javascript( urls_resolved( markdownify( hashtaggify(s) ) ) )
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
