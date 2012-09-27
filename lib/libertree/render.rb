# encoding: utf-8
require 'net/http'
require 'nokogiri'
require 'libertree/model'

module Libertree
  def self.markdownify(s)
    return ''  if s.nil? or s.empty?

    markdown ||= Redcarpet::Markdown.new(
      Libertree::Markdown.new,
      {
        autolink: true,
        space_after_headers: true,
        no_intra_emphasis: true,
        strikethrough: true
      }
    )
    markdown.render s
  end

  def self.hashtaggify(s)
    return ''  if s.nil? or s.empty?
    s.force_encoding('utf-8').gsub(/(?<=^|\s|\()#([\p{Word}\p{Pd}]+)(?=\s|\b|\)|$)/i) {
      %|<a href="/rivers/ensure_exists/%23#{$1.downcase}" class="hashtag">##{$1}</a>|
    }
  end

  def self.post_processing(s)
    return ''  if s.nil? or s.empty?

    # Crude autolinker for relative links to local resources
    s.gsub!(%r{(?<=^|\s|^<p>|^<li>)(/posts/show/\d+(/\d+(#comment-\d+)?)?)}, "<a href='\\1'>\\1</a>")

    html = Nokogiri::HTML::fragment(s)
    html.css('a').each do |a|
      # strip javascript
      if a['href']
        a['href'] = a['href'].gsub(/javascript:/i, 'nojavascript:')
      end
      # resolve uris
      if a['href'] =~ %r{http://} && ! a['href'].start_with?($conf['frontend_url_base'])
        a['href'] = resolve_redirection(a['href'])
      end
    end

    # hashtaggify everything that is not inside of code or pre tags
    html.traverse do |node|
      if node.text? && ["code", "pre", "a"].all? {|tag| node.ancestors(tag).empty? }
        hashtag = Libertree::hashtaggify(node.text)
        if ! hashtag.eql? node.text
          node.replace hashtag
        end
      end
    end

    html.to_s
  end

  def self.resolve_redirection( url_s )
    cached = Libertree::Model::UrlExpansion[ url_short: url_s ]
    if cached
      return cached.url_expanded
    end

    resolution = url_s
    begin
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

          res = Net::HTTP.get_response(url)

          if res.header['location']
            url = URI.parse(res.header['location'])
            num_redirections += 1
          else
            resolution = url.to_s
            break
          end
        end
      end
    rescue SocketError, Timeout::Error, URI::InvalidURIError, IOError, Errno::ECONNREFUSED, Errno::ECONNRESET, Net::HTTPBadResponse, ArgumentError
      # Use URL as is.  Arbo can delete url_expansions record to force retry.
    end

    Libertree::Model::UrlExpansion.create(
      :url_short => url_s,
      :url_expanded => resolution
    )

    resolution
  end

  def self.render(s, autoembed=false)
    html = markdownify(s)
    if autoembed
      # FIXME: maybe this should only be done for posts
      html = Libertree::Embedder.inject_objects(html)
    end
    html
  end

  module HasRenderableText
    def text_rendered(autoembed=false)
      Libertree.render self.text, autoembed
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
