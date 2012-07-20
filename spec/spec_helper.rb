require_relative '../app'
require_relative 'factories'
require 'capybara/rspec'

Capybara.configure do |config|
  config.default_driver = :rack_test
  config.app            = Ramaze.middleware
end

# For in-browser testing:
# ::Capybara.current_driver = ::Capybara.javascript_driver

Ramaze.setup_dependencies
Ramaze.options.roots << File.expand_path(File.dirname(__FILE__))
