module Ramaze
  module Helper
    module Views
      def js_nocache(file)
        "<script src=\"/js/#{file}.js?t=#{File.mtime("public/js/#{file}.js").to_i}\" type=\"text/javascript\"></script>"
      end
      def css_nocache(file, media="screen")
        "<link href=\"/css/#{file}.css?t=#{File.mtime("public/css/#{file}.css").to_i}\" media=\"#{media}\" rel=\"stylesheet\" type=\"text/css\" />"
      end
      def like_list(entity)
        entity.likes.map { |l| ::CGI.escape_html(l.member.name_display) }.join(', ')
      end
      def commenter_list(post)
        post.comments.map { |l| ::CGI.escape_html(l.member.name_display) }.uniq.join(', ')
      end
    end
  end
end
