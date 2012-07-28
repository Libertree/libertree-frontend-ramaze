module Ramaze
  module Helper
    module Views
      def js_nocache(file)
        "<script src=\"/js/#{file}.js?t=#{File.mtime("public/js/#{file}.js").to_i}\" type=\"text/javascript\"></script>"
      end

      def lang_option(locale, name)
        "<option value=\"#{locale}\" #{account.locale.eql?(locale) ? "selected" : ""}>#{name}</option>"
      end
    end
  end
end
