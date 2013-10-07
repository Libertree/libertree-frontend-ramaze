module Ramaze
  module Helper
    module Views
      def current_theme
        $conf['themes'].find {|t| t == account.theme } || 'default'
      end

      def help_bubble(s, title="help|What does this mean?")
        "<a class='help' href='#' rel='popover' title='#{s_(title)}' data-content=\"#{s}\">?</a>"
      end

      def img(src,options={})
        "<img src='/themes/#{current_theme}/images/#{src}' #{options.map{|k,v| "#{k}='#{v}'"}.join(' ')} />"
      end

      def js_nocache(file)
        "<script src=\"/js/#{file}.js?t=#{File.mtime("public/js/#{file}.js").to_i}\" type=\"text/javascript\"></script>"
      end

      def css_nocache(file, media="screen")
        theme = current_theme
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

      def job_param_format(params)
        return ""  if params.nil?

        # add hints
        if params['server_id']
          server = Libertree::Model::Server[ params['server_id'].to_i ]
          if server
            params['server_id'] = "<span title='#{server.domain}'>#{params['server_id']}</span>"
          end
        end

        if params['member_id']
          member = Libertree::Model::Member[ params['member_id'].to_i ]
          if server
            params['member_id'] = "<span title='#{member.username}'>#{params['member_id']}</span>"
          end
        end

        params.to_s
      end
    end
  end
end
