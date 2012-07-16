require 'libertree/model'
require 'net/http'
require 'uri'

module Jobs
  def self.list
    [ "http:avatar" ]
  end

  module Http

    class Avatar
      def self.perform(params)
        member = Libertree::Model::Member[ params['member_id'] ]

        begin
          uri = URI.parse(params['avatar_url'])
          if uri.path.empty?
            log_error "URL contains no path: #{params['avatar_url']}"
          else
            Timeout.timeout(10) do
              Net::HTTP.start(uri.host, uri.port) { |http|
                resp = http.get(uri.path)
                ext = File.extname(uri.path)
                if ! ['.png', '.gif', '.jpg', '.jpeg'].include?(ext.downcase)
                  log_error "Invalid avatar file type: #{ext}"
                  # TODO: mark this job as failed
                else
                  File.open( "public/images/avatars/#{member.id}#{ext}", 'wb' ) { |file|
                    file.write(resp.body)
                  }
                  member.avatar_path = "/images/avatars/#{member.id}#{ext}"
                  return true
                end
              }
            end
          end
        rescue URI::InvalidURIError, ArgumentError => e
          # TODO: mark this job as failed, because the URL cannot be parsed
          log_error "Invalid URI: #{params['avatar_url']}"
        rescue Timeout::Error
          # ignore
        end
      end
    end
  end
end

