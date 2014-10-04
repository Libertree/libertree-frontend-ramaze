#!/usr/bin/env rackup

require 'ramaze'
require 'sass'
require 'yaml'
require 'mini_magick'
require 'fast_gettext'
require 'markdown'
require_relative 'lib/libertree/lang'
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

Ramaze.start  :root => __DIR__, :started => true

run Rack::URLMap.new(
  "/" => Ramaze,
  "/apii" => Libertree::MemberAPI.new
)
