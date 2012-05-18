require 'ramaze'
require 'm4dbi'
require 'rdbi-driver-postgresql'
require 'syck'
require 'mini_magick'
require 'loofah'
require 'redcarpet'

$conf = Syck.load( File.read("#{ File.dirname( __FILE__ ) }/config/application.yaml") )
ENV['RACK_ENV'] = $conf['environment'] || 'live'

if $conf['graphicsmagick']
  MiniMagick.processor = :gm
end

all_confs = Syck.load( File.read("#{ File.dirname( __FILE__ ) }/config/database.yaml") )
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
require 'libertree/client'

require_relative 'lib/libertree/render'
require_relative 'lib/libertree/markdown'

require_relative 'controller/base'
require_relative 'controller/accounts'
require_relative 'controller/comment-likes'
require_relative 'controller/comments'
require_relative 'controller/home'
require_relative 'controller/invitations'
require_relative 'controller/main'
require_relative 'controller/notifications'
require_relative 'controller/profiles'
require_relative 'controller/post-likes'
require_relative 'controller/posts'
require_relative 'controller/rivers'

require_relative 'controller/api/v1/base'
require_relative 'controller/api/v1/posts'

Ramaze::Cache.options.session = Ramaze::Cache::MemCache.using(compression: false)
Rack::RouteExceptions.route( Exception, '/error' )
