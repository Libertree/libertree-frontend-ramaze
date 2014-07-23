module Ramaze
  module Helper
    module Comment
      def comment_link(comment)
        "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}"
      end

      def commenters(comments)
        mktemplate = lambda {|id, name|
          %|<a class="commenter-ref" data-member-id="#{id}" title="#{_("Click to see previous comment by %s") % ::CGI.escape_html(name)}">@%s</a>|
        }

        cache = {}
        comments.map do |comment|
          if cached = cache[comment.member_id]
            cached
          else
            commenter = comment.member
            name = commenter.name_display
            template = mktemplate.call(comment.member_id, name)
            dict = {}

            partial_names =
              [ name, name.split(/[ :,-]/, 2)[0] ] +
              (2..[20,name.length].min).map { |len| name[0...len] }
            partial_names.each do |part|
              dict["@#{part.downcase}"] = template % part
            end
            cache[comment.member_id] = dict
          end

          {comment.member_id => cache[comment.member_id]}
        end
      end

      def comment_text_rendered_and_participants_linked( comment, commenters, account=nil, i=nil )
        s = comment.text_rendered(account)
        # abort if there are no username references
        return s  unless s.include?('@')

        # Ignore names of comment.member in the final dictionary.
        commenters = commenters[0...i]  if i
        dict = commenters.reduce({}) do |acc,hash|
          if hash.first.first != comment.member_id
            acc.merge(hash.first.last)
          else
            acc
          end
        end

        # Turn possible shortenings into regexp with multiple comparisons,
        # starting with the longest.
        s.gsub( /#{dict.keys.map{|k|Regexp.quote(k)}.sort.reverse.join('|')}/i ) do |m|
          dict[m.downcase]
        end
      end
    end
  end
end
