require 'libertree/job-processor'
require_relative 'lib/jobs'

if ARGV[0].nil?
  $stderr.puts "#{$0} <path to application.yaml>"
  exit 1
end

jobp = Libertree::JobProcessor.new( ARGV[0] )
jobp.extend Jobs
jobp.run
