module Controller
  class CommentLikes < Base
    map '/likes/comments'

    before_all do
      require_login
    end

    layout nil

    def create(comment_id)
      comment = Libertree::Model::Comment[ comment_id.to_i ]

      if comment
        like = Libertree::Model::CommentLike.find_or_create(
          'member_id'  => account.member.id,
          'comment_id' => comment.id,
        )

        Libertree::Model::Job.create_for_forests(
          like.forests,
          task: 'request:COMMENT-LIKE',
          params: {
            'comment_like_id' => like.id,
          }
        )

        return {
          'comment_like_id' => like.id,
          'num_likes'       => "#{comment.likes.count} like#{plural_s(comment.likes.count)}",
        }.to_json
      end

      ""
    end

    def destroy(comment_like_id)
      like = Libertree::Model::CommentLike[ comment_like_id.to_i ]
      if like && like.member == account.member
        Libertree::Model::Job.create_for_forests(
          like.forests,
          task: 'request:COMMENT-LIKE-DELETE',
          params: {
            'comment_like_id' => like.id,
          }
        )
        like.delete_cascade
      end

      "#{like.comment.likes.count} like#{plural_s(like.comment.likes.count)}"
    end
  end
end
