## Libertree Frontend (Ramaze)

### Requirements:

* libertree-db gem/repo
* libertree-client gem/repo
* GraphicsMagick or ImageMagick

It is recommended to use RVM for Ruby and gem management, but this is not
required.  memcached is recommended, but not required.

### Installation and Setup

    gem install bundler
    bundle install
    cp config/database.yaml.example config/database.yaml  # edit as desired
    cp config/application.yaml.example config/application.yaml  # edit as desired

### Running

    ./css-build.sh
    bundle exec unicorn -p <port number>
    bundle exec ruby websocket-server.rb

### Developing

A good place to start is app.rb since that is the base of the frontend.