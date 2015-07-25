module Controller
  class JS < Base
    map '/js'

    before_all do
      init_locale
    end

    layout do |path|
      nil
    end

    provide(:js, type: 'application/javascript', engine: :erb )
  end
end
