#!/usr/bin/env rackup

require 'ramaze'
require 'sass'
require 'yaml'
require 'mini_magick'
require 'fast_gettext'
require 'markdown'
require 'libertree/lang'
require 'libertree/db'

Libertree::DB.load_config("#{ File.dirname( __FILE__ ) }/config/database.yaml")
$dbh = Libertree::DB.dbh
require 'libertree/model'

$conf = YAML.load( File.read("#{ File.dirname( __FILE__ ) }/config/application.yaml") )
$conf['websocket_blacklist'] ||= []
ENV['RACK_ENV'] = $conf['environment'] || 'live'

# -----------------------------

require ::File.expand_path('../app', __FILE__)
require './member-api/member-api'
require './vue-api/vue-api'

Ramaze.start  :root => __DIR__, :started => true

$libertree_member_api = Libertree::MemberAPI.new
$libertree_vue_api = Libertree::VueAPI.new

class APIRoutingAdapter
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    # Version 1 of the API was served from Ramaze, but the API has since been
    # moved out of Ramaze.
    if request.path =~ %r{^/api/(?!v1)}
      # Have the Grape API handle the request
      env_without_api_prefix = env.dup
      ['REQUEST_PATH', 'PATH_INFO', 'REQUEST_URI'].each do |key|
        env_without_api_prefix[key] = env_without_api_prefix[key].gsub(%r{^/api}, '')
      end
      $libertree_member_api.call(env_without_api_prefix)
    elsif request.path =~ %r{^/vue-api}
      $libertree_vue_api.call env
    else
      # Let Ramaze handle the request
      @app.call(env)
    end
  end
end

use APIRoutingAdapter

run Ramaze
