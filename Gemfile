source 'http://rubygems.org'
ruby "2.2.2"

gem 'ramaze'
gem 'innate'
# gem 'ramaze', git: 'git://github.com/Ramaze/ramaze.git'
# gem 'innate', git: 'git://github.com/Ramaze/innate.git'
gem 'json'
gem 'pg'
gem 'sequel'
gem 'bcrypt-ruby'
gem 'grape'
gem 'dalli'  # memcached client
gem 'mini_magick'
gem 'sass'
gem 'ruby-oembed'
gem 'fast_gettext'
gem 'grape-swagger'

group 'extensions' do
  gem 'json'
  gem 'bcrypt-ruby'
  gem 'nokogiri'
  gem 'unicorn'
  gem 'curb'           # libcurl-dev (Debian) / libcurl-devel (Fedora)
  # Doesn't compile on Heroku
  # gem 'ruby-filemagic' # libmagic-dev (Debian) / file-devel (Fedora)
  gem 'gpgme'  # to verify PGP public keys before storing them
end

gem 'libertree-model', git: 'git://github.com/Libertree/libertree-model-rb.git', branch: 'vue-js'
# gem 'libertree-model', path: '../libertree-model-rb'

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
  gem 'byebug', platforms: [:ruby_21]
  gem 'thin'  # For debugging, because it doesn't time out the connection like unicorn
end
