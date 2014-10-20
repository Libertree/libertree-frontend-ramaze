module Controller
  class JS < Base
    map '/js'

    before_all do
      default_before_filter
    end

    layout do |path|
      nil
    end

    provide(:js, type: 'application/javascript', engine: :erb )
  end
end
