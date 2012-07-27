if ENV['LIBERTREE_ENV'] != 'test'
  $stderr.puts "Are you sure you want to run tests in a non-test LIBERTREE_ENV?"
  $stderr.puts "Running tests DESTROYS data in the tested database."
  $stderr.puts "Comment out this check in spec_helper.rb if you know what you're doing."
  exit 1
end

require_relative '../app'
require_relative 'factories'
require 'capybara/rspec'

Capybara.configure do |config|
  config.default_driver = :rack_test
  config.app            = Ramaze
end

Ramaze.setup_dependencies
Ramaze.options.roots << File.expand_path(File.dirname(__FILE__)+'/..')

$dbh.execute "TRUNCATE accounts CASCADE"
