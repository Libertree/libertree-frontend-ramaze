require 'curb'
require 'json'
require 'filemagic'

module Libertree
  module RemoteStorage
    # @param [String] the full remote storage account handle, e.g. rekado@my.remotestorage.domain
    # @return [Hash] returns a hash containing the remoteStorage definition or nil
    def self.finger(handle)
      base_url = handle.split(/@/, 2)[1]
      return  if base_url.nil?

      url = "http://#{base_url}/.well-known/host-meta?resource=acct:#{handle}"
      res = Curl::Easy.http_get(url) do |req|
        req.follow_location = true
        req.timeout = 15
      end

      begin
        json = JSON[res.body_str]
        info = json['links'].find {|e| e.keys.include?('rel') && e['rel'] == 'remoteStorage' }
        if validate info then info else nil end
      rescue Exception => e
        nil
      end
    end

    def self.validate(info)
      info['rel'] == 'remoteStorage' &&
        info['href'] &&
        ! info['href'].empty? &&
        info['properties'] &&
        info['properties']['auth-method'] == "https://tools.ietf.org/html/draft-ietf-oauth-v2-26#section-4.2" &&
        info['properties']['auth-endpoint'] &&
        ! info['properties']['auth-endpoint'].empty?
    end

    # @param [Hash] the hash containing the remoteStorage definition or nil
    def self.auth_request_url(info, update_token, scope='public/libertree:rw')
      url = URI.parse(info['properties']['auth-endpoint'])
      redirect = "#{$conf['frontend_url_base']}/remotestorage/connection/#{update_token}"
      query_string = URI.encode_www_form({
        "redirect_uri" => redirect,
        "scope" => scope,
        "client_id" => $conf['frontend_url_base']
      })
      if url.query.nil?
        url.query = query_string
      else
        url.query = url.query + "&" + query_string
      end
      url.to_s
    end

    # returns a link on success, nil on failure
    def self.upload(filepath, storage_url, access_token, path='public/libertree')
      fm = FileMagic.new(FileMagic::MAGIC_MIME)
      content_type = fm.file(filepath)
      fm.close

      data = IO.read(filepath)

      # append time to file name to avoid overwriting files with the same name
      ext = File.extname(filepath)
      basename = File.basename(filepath, ext)[0..50] # truncate to 50 chars
      filename = "#{basename}-#{Time.now.strftime('%s%4N')}#{ext}"
      remote_url = "#{storage_url}/#{path}/#{filename}"

      res = Curl::Easy.http_put(remote_url, data) do |req|
        req.timeout = 30 # TODO: how long may the upload take?
        req.headers['Authorization'] = "Bearer #{access_token}"
        req.headers['Content-type'] = content_type

        req.on_success {|easy| return remote_url }
      end

      nil
    end

    def self.delete(path, storage)
      Curl::Easy.http_delete("#{storage.storage_url}/#{path}") do |req|
        req.headers['Authorization'] = "Bearer #{storage.access_token}"
        req.on_success {|easy| return true }
      end
      false
    end

    def self.get(path, storage)
      Curl::Easy.http_get("#{storage.storage_url}/#{path}") do |req|
        req.headers['Authorization'] = "Bearer #{storage.access_token}"
        req.on_success do |res|
          return JSON[res.body_str]
        end
      end
    end
  end
end
