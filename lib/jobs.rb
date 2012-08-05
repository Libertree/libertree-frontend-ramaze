require 'libertree/model'
require 'libertree/job-processor'
require_relative 'libertree/embedder'
require 'net/http'
require 'uri'

module Jobs
  def self.list
    {
      "http:avatar" => Http::Avatar,
      "http:embed"  => Http::Embed,
    }
  end

  module Http

    class Avatar
      class Redirect < StandardError
        def initialize(url)
          @url = url
        end
        def url
          @url
        end
      end

      def self.fetch(url_string, member, follow_redirect=false)
        uri = URI.parse(url_string)
        if uri.path.empty?
          raise Libertree::JobFailed, "URL contains no path: #{url_string}"
        end

        ext = File.extname(uri.path)
        if ! ['.png', '.gif', '.jpg', '.jpeg'].include?(ext.downcase)
          raise Libertree::JobFailed, "Invalid avatar file type: #{ext}"
        end

        Timeout.timeout(15) do
          http = Net::HTTP.new(uri.host, uri.port)
          if uri.scheme.eql? "https"
            http.use_ssl = true
          end

          resp = http.start {|h| h.get(uri.path)}
          if follow_redirect && [Net::HTTPRedirection, Net::HTTPMovedPermanently].include?(resp.class)
            raise Avatar::Redirect.new(resp['location'])
          end

          if [Net::HTTPSuccess, Net::HTTPOK].include? resp.class
            File.open( "public/images/avatars/#{member.id}#{ext}", 'wb' ) { |file|
              file.write(resp.body)
            }
            member.avatar_path = "/images/avatars/#{member.id}#{ext}"
          end
        end
      end

      def self.perform(params)
        member = Libertree::Model::Member[ params['member_id'] ]
        raise Libertree::JobFailed, "No member with id #{params['member_id']}"  unless member

        args = [params['avatar_url'], member, true]

        begin
          self.fetch *args
        rescue Avatar::Redirect => e
          args = [e.url, member, false]
          retry
        rescue URI::InvalidURIError, ArgumentError => e
          raise Libertree::JobFailed, "Invalid URI: #{params['avatar_url']}"
        rescue Timeout::Error
          # ignore
        end
      end
    end

    class Embed
      def self.perform(params)
        cached = Libertree::Model::EmbedCache[ url: params['url'] ]
        unless cached
          response = Libertree::Embedder.get(params['url'])
          if response
            Libertree::Model::EmbedCache.create(
              url: params['url'],
              object: response
            )
          end
        end
      end
    end

  end
end

