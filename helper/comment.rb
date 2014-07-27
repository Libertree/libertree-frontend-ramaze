module Ramaze
  module Helper
    module Comment
      def comment_link(comment)
        "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}"
      end

      # get a hash indexed by commenter member id yielding:
      # - all comment ids of this member in this thread
      # - the display name
      # - the member id
      def commenters(comments)
        @commenters ||= comments.reduce({}) do |hash,comment|
          username = comment.member.username
          if hash[username]
            hash[username][:comment_ids] << comment.id
          else
            hash[username] = {
              comment_ids: [comment.id],
              id: comment.member.id,
              name: comment.member.name_display
            }
          end
          hash
        end
      end
    end
  end
end
