module Ramaze
  module Helper
    module Views
      def help_bubble(s, title="help|What does this mean?")
        "<a class='help' href='#' rel='popover' title='#{s_(title)}' data-content='#{s}'>?</a>"
      end

      def img(src,options={})
        theme = account.theme || 'default'
        "<img src='/themes/#{theme}/images/#{src}' #{options.map{|k,v| "#{k}='#{v}'"}.join(' ')} />"
      end

      def js_nocache(file)
        "<script src=\"/js/#{file}.js?t=#{File.mtime("public/js/#{file}.js").to_i}\" type=\"text/javascript\"></script>"
      end

      def css_nocache(file, media="screen")
        theme = account.theme || 'default'
        "<link href=\"/themes/#{theme}/css/#{file}.css?t=#{File.mtime("public/themes/#{theme}/css/#{file}.css").to_i}\" media=\"#{media}\" rel=\"stylesheet\" type=\"text/css\" />"
      end

      # loads a script for the current controller
      def controller_js
        filename = self.route.path.gsub(/[^a-z_-]/,'')
        if File.exist?("public/js/controller/#{filename}.js")
          js_nocache "controller/#{filename}"
        else
          ""
        end
      end

      def like_list(entity)
        entity.likes.map { |l| ::CGI.escape_html(l.member.name_display) }.join(', ')
      end

      def commenter_list(post)
        post.comments.map { |l| ::CGI.escape_html(l.member.name_display) }.uniq.join(', ')
      end

      def timefmt(time)
        return ""  if time.nil?
        time.strftime('%F %T')
      end
    end
  end
end
