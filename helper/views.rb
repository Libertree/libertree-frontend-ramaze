module Ramaze
  module Helper
    module Views
      def img(src,options={})
        # TODO: theme account setting
        theme = 'default'
        "<img src='/themes/#{theme}/images/#{src}' #{options.map{|k,v| "#{k}='#{v}'"}.join(' ')} />"
      end
      def js_nocache(file)
        "<script src=\"/js/#{file}.js?t=#{File.mtime("public/js/#{file}.js").to_i}\" type=\"text/javascript\"></script>"
      end
      def css_nocache(file, media="screen")
        "<link href=\"/css/#{file}.css?t=#{File.mtime("public/css/#{file}.css").to_i}\" media=\"#{media}\" rel=\"stylesheet\" type=\"text/css\" />"
      end
    end
  end
end
