# encoding: utf-8
require 'net/http'
require 'nokogiri'
require 'libertree/model'

module Libertree
  def self.markdownify(s, opts = [ :filter_html, :strike, :autolink, :hard_wrap ])
    return ''  if s.nil? or s.empty?
    Markdown.new( s, *opts ).to_html.force_encoding('utf-8')
  end

  def self.hashtaggify(s)
    return ''  if s.nil? or s.empty?
    s.gsub(/(?<=^|\p{Space}|\()#([\p{Word}\p{Pd}]+)(?=\p{Space}|\b|\)|$)/i) {
      %|<a href="/tags/#{$1.downcase}" class="hashtag">##{$1}</a>|
    }
  end

  # @param [String] rendered markdown as HTML string
  def self.autolinker(s)
    return ''  if s.nil? or s.empty?

    # Crude autolinker for relative links to local resources
    s.gsub(
      %r{(?<=^|\p{Space}|^<p>|^<li>)(/posts/show/\d+(/\d+/?(#comment-\d+)?|/(\d+/?)?)?)},
      "<a href='\\1'>\\1</a>"
    )
  end

  # @param [Nokogiri::HTML::DocumentFragment] parsed HTML tree
  def self.process_links(html)
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
    html
  end

  # @param [Nokogiri::HTML::DocumentFragment] parsed HTML tree
  def self.apply_hashtags(html)
    # hashtaggify everything that is not inside of code, link or pre tags
    html.traverse do |node|
      if node.text? && ["code", "pre", "a"].all? {|tag| node.ancestors(tag).empty? }
        hashtag = Libertree::hashtaggify(node.text)

        if ! hashtag.eql? node.text
          # nokogiri strips trailing whitespace, so
          # we need to replace it with &#32; to preserve it
          if hashtag[-1] =~ /\s/
            hashtag = hashtag[0..-2] + "&#32;"
          end

          node.replace( Nokogiri::HTML.fragment(hashtag) )
        end
      end
    end
    html
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

  def self.render_unsafe(s)
    Markdown.new(
      s,
      :strike,
      :autolink,
      :hard_wrap
    ).to_html.force_encoding('utf-8')
  end

  # filter HTML but ignore markdown
  def self.plain(s)
    Nokogiri::HTML.fragment(self.markdownify(s)).inner_text
  end

  def self.render(s, autoembed=false, filter_images=false)

    # FIXME: when :smart is enabled, "/posts/show/987/123/#comment-123" is
    # turned into "<p>/posts/show/987/123/#comment&ndash;123</p>".
    #
    # This only affects relative URLs that should be caught by the autolinker.
    # The problem could be fixed by moving the autolinker for relative URLs
    # into the markdown parser. A solution that matches against
    # "#comment&ndash;" would be quite ugly.

    opts = [
      :filter_html,
      #:smart,
      :strike,
      :autolink,
      :hard_wrap
    ]
    opts.push :no_images if filter_images

    pipeline = [
      method(:autolinker),
      Nokogiri::HTML.method(:fragment),
      method(:process_links),
      method(:apply_hashtags),
      (Embedder.method(:inject_objects) if autoembed)
    ].compact

    # apply methods sequentially to string
    pipeline.reduce(markdownify(s, opts)) {|acc,f| f.call(acc)}.to_s
  end

  module HasRenderableText
    def text_rendered(account=nil)
      if account
        autoembed = account.autoembed
        filter_images = account.filter_images
      else
        autoembed = false
        filter_images = false
      end

      Libertree.render self.text, autoembed, filter_images
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
