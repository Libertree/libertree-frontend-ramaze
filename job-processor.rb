require 'libertree/db'
require 'libertree/job-processor'

########################
# FIXME: M4DBI wants us to connect to the db before defining models.  As model
# definitions are loaded when 'lib/jobs' is required, we have to do this first.
Libertree::DB.load_config "#{File.dirname( __FILE__ ) }/config/database.yaml"
Libertree::DB.dbh
#########################

require_relative 'lib/jobs'

if ARGV[0].nil?
  $stderr.puts "#{$0} <path to application.yaml>"
  exit 1
end

jobp = Libertree::JobProcessor.new( ARGV[0] )
jobp.extend Jobs
jobp.run
