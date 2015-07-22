#!/usr/bin/env rackup

require 'ramaze'
require 'sass'
require 'yaml'
require 'mini_magick'
require 'fast_gettext'
require 'markdown'
require 'libertree/lang'
require 'libertree/db'

if ENV['DATABASE_URL']
  # Heroku
  ENV['DATABASE_URL'] =~ %r{postgres://(.+?):(.+?)@(.+?):(\d+)/(.+?)$}
  Libertree::DB.config = {
    'username' => $1,
    'password' => $2,
    'host' => $3,
    'port' => $4,
    'database' => $5,
  }
else
  Libertree::DB.load_config("#{ File.dirname( __FILE__ ) }/config/database.yaml")
end
$dbh = Libertree::DB.dbh
require 'libertree/model'

conf_filepath = "#{ File.dirname( __FILE__ ) }/config/application.yaml"
if File.exists?(conf_filepath)
  $conf = YAML.load( File.read(conf_filepath) )
else
  # Please leave these as defined without looping or string construction
  $conf = {
    'environment' => ENV['LIBERTREE_ENV'],
    'websocket_js_host' => ENV['LIBERTREE_WEBSOCKET_JS_HOST'],
    'secure_websocket' => ENV['LIBERTREE_SECURE_WEBSOCKET'],
    'graphicsmagick' => ENV['LIBERTREE_GRAPHICSMAGICK'],
    'memcache' => ENV['LIBERTREE_MEMCACHE'],
    'api_min_time_between' => ENV['LIBERTREE_API_MIN_TIME_BETWEEN'].to_i,
    'title_insert' => ENV['LIBERTREE_TITLE_INSERT'],
    'frontend_url_base' => ENV['LIBERTREE_FRONTEND_URL_BASE'],
    'themes' => ENV['LIBERTREE_THEMES'].split(',').map(&:strip),
  }
end
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
