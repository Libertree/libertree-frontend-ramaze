require 'libertree/model'
require 'libertree/job-processor'
require 'net/http'
require 'uri'

module Jobs
  def self.list
    { "http:avatar" => Http::Avatar }
  end

  module Http

    class Avatar
      def self.perform(params)
        member = Libertree::Model::Member[ params['member_id'] ]

        begin
          uri = URI.parse(params['avatar_url'])
          if uri.path.empty?
            raise Libertree::JobFailed, "URL contains no path: #{params['avatar_url']}"
          else
            Timeout.timeout(10) do
              Net::HTTP.start(uri.host, uri.port) { |http|
                resp = http.get(uri.path)
                ext = File.extname(uri.path)
                if ! ['.png', '.gif', '.jpg', '.jpeg'].include?(ext.downcase)
                  raise Libertree::JobFailed, "Invalid avatar file type: #{ext}"
                else
                  File.open( "public/images/avatars/#{member.id}#{ext}", 'wb' ) { |file|
                    file.write(resp.body)
                  }
                  member.avatar_path = "/images/avatars/#{member.id}#{ext}"
                end
              }
            end
          end
        rescue URI::InvalidURIError, ArgumentError => e
          raise Libertree::JobFailed, "Invalid URI: #{params['avatar_url']}"
        rescue Timeout::Error
          # ignore
        end
      end
    end
  end
end

