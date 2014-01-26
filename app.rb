require 'ramaze'
require 'sass'
require 'm4dbi'
require 'rdbi-driver-postgresql'
require 'yaml'
require 'mini_magick'
require 'fast_gettext'
require 'markdown'
require_relative 'lib/libertree/lang'


[ 'frontend', 'email' ].each do |domain|
  FastGettext.add_text_domain(domain, :path => 'locale', :type => :po)
end
FastGettext.default_text_domain = 'frontend'
FastGettext.default_available_locales = Libertree::LANG.map(&:first)
include FastGettext::Translation

$conf = YAML.load( File.read("#{ File.dirname( __FILE__ ) }/config/application.yaml") )
$conf['websocket_blacklist'] ||= []
ENV['RACK_ENV'] = $conf['environment'] || 'live'

# compile SCSS to CSS
Dir.glob("public/themes/*") do |theme_path|
  Dir.mkdir "#{theme_path}/css" unless Dir.exists? "#{theme_path}/css"
  Dir.glob("#{theme_path}/scss/*.scss") do |filename|
    target = filename.match(%r{/scss/(.+)\.scss}) { "#{theme_path}/css/#{$1}.css" }
    Sass.compile_file(filename, target)
  end
end

if $conf['graphicsmagick']
  MiniMagick.processor = :gm
end

all_confs = YAML.load( File.read("#{ File.dirname( __FILE__ ) }/config/database.yaml") )
env = ENV['LIBERTREE_ENV'] || 'development'
conf_db = all_confs[env]

$dbh ||= M4DBI.connect(
  :PostgreSQL,
  host:     conf_db['host'],
  database: conf_db['database'],
  username: conf_db['username'],
  password: conf_db['password']
)

require 'libertree/model'
Libertree::DB.config = conf_db

require 'libertree/embedder'
require_relative 'lib/libertree/render'
require_relative 'lib/libertree/remotestorage'

require_relative 'controller/base'
require_relative 'controller/accounts'
require_relative 'controller/chat-messages'
require_relative 'controller/comment-likes'
require_relative 'controller/comments'
require_relative 'controller/contact-lists'
require_relative 'controller/home'
require_relative 'controller/invitations'
require_relative 'controller/main'
require_relative 'controller/messages'
require_relative 'controller/notifications'
require_relative 'controller/profiles'
require_relative 'controller/profiles_local'
require_relative 'controller/posts-hidden'
require_relative 'controller/post-likes'
require_relative 'controller/pools'
require_relative 'controller/springs'
require_relative 'controller/posts'
require_relative 'controller/remotestorage'
require_relative 'controller/rivers'
require_relative 'controller/tags'
require_relative 'controller/intro'

require_relative 'controller/api/v1/base'
require_relative 'controller/api/v1/invitations'
require_relative 'controller/api/v1/posts'
require_relative 'controller/api/v1/comments'
require_relative 'controller/api/v1/notifications'

require_relative 'controller/admin/base'
require_relative 'controller/admin/main'
require_relative 'controller/admin/forests'
require_relative 'controller/admin/servers'
require_relative 'controller/admin/jobs'

if $conf['memcache']
  Ramaze::Cache.options.session = Ramaze::Cache::MemCache.using(compression: false)
end

Ramaze.middleware :live do
  use Rack::CommonLogger, Ramaze::Log  if $conf['log_http_requests']
  use Rack::RouteExceptions
  use Rack::ShowStatus
  use Rack::ConditionalGet
  use Rack::ETag, 'public'
  use Rack::Head

  run Ramaze.core
end
Rack::RouteExceptions.route( Exception, '/error' )
