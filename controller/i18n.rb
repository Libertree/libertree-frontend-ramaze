module Controller
  class I18n < Base
    map '/i18n'

    layout { nil }

    def index(key)
      # TODO: Check that this isn't an attack vector
      _(key)
    end

    def n(key_1, key_many, n)
      # TODO: Check that this isn't an attack vector
      n_(key_1.to_s, key_many.to_s, n.to_i)
    end

  end
end
