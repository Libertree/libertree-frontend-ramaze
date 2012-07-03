require 'libertree/job-processor'
require_relative 'lib/jobs'

log_path = ARGV[0]
queue = "test"

jobp = Libertree::JobProcessor.new( log_path, queue )
jobp.extend Jobs
jobp.run
