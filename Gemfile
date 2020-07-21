source 'https://rubygems.org'

gem 'dalli', '~> 2.7.6'  # memcached client
gem 'fast_gettext', '~> 1.8.0'
gem 'grape', '~> 0.19.2'
gem 'grape-swagger', '~> 0.33.0'
gem 'innate', '~> 2015.10.28'
gem 'mini_magick', '~> 4.9.5'
gem 'ramaze', '~> 2012.12.08'
gem 'ruby-oembed', '~> 0.13.1'
gem 'sass', '~> 3.7.4'

group 'extensions' do
  gem 'bcrypt-ruby', '~> 3.1.5'
  gem 'curb', '~> 0.9.10'  # libcurl-dev (Debian) / libcurl-devel (Fedora)
  gem 'gpgme', '~> 2.0.20'  # to verify PGP public keys before storing them
  gem 'json', '~> 2.2.0'
  gem 'nokogiri', '~> 1.10.10'
  gem 'ruby-filemagic', '~> 0.7.2' # libmagic-dev (Debian) / file-devel (Fedora)
  gem 'unicorn', '~> 5.5.1'
end

gem 'libertree-model', '~> 0.9.16'

group 'development' do
  gem 'rspec'
  gem 'capybara'
  gem 'selenium-webdriver'
  gem 'factory_girl'
  gem 'racksh'
  gem 'linecache19', git: 'git://github.com/mark-moseley/linecache', platforms: [:ruby_19]
  gem 'ruby-debug-base19x', '~> 0.11.30.pre4', platforms: [:ruby_19]
  gem 'ruby-debug19', platforms: [:ruby_19]
  gem 'pry-byebug', platforms: [:ruby_20]
  # gem 'byebug', platforms: [:ruby_21, :ruby_22]
  gem 'thin'  # For debugging, because it doesn't time out the connection like unicorn
end
