require 'grape'
require 'libertree/model'
require 'libertree/age'

# Dev notes:

# Grape does type coercion and type confirmation for us, so to_i, to_s etc.
# on params are not necessary.

module Libertree
  class ValidateNonEmpty < Grape::Validations::Validator
    def validate_param!(attr_name, params)
      if params[attr_name].strip.empty? || Libertree.plain( params[attr_name] ).empty?
        raise(
          Grape::Exceptions::Validation,
          params: [@scope.full_name(attr_name)],
          message: "#{attr_name.inspect} cannot be empty"
        )
      end
    end
  end

  class ValidatePositiveInteger < Grape::Validations::Validator
    def validate_param!(attr_name, params)
      if params[attr_name].to_i < 1
        raise(
          Grape::Exceptions::Validation,
          params: [@scope.full_name(attr_name)],
          message: "#{attr_name.inspect} must be a positive integer"
        )
      end
    end
  end

  class VueAPI < Grape::API
    format :json
    prefix 'vue-api'

    helpers do
      def set_account_from_sid # session id
        session_account = Libertree::Model::SessionAccount[cookies['innate.sid']]
        if session_account.nil?
          error! "invalid sid", 404
        end
        @account = session_account.account
      end
    end

    after_validation do
      set_account_from_sid
    end

    # ---------------------

    resource 'notifications' do
      desc "Retrieve notifications"

      params do
        optional 'only-unseen', type: Boolean, default: true, desc: "whether to retrieve only unseen notifications (default), or all notifications"
        optional 'n', type: Integer, default: 32, validate_positive_integer: true, desc: "the maximum number of notifications to return"
      end

      get do
        n = params['n']

        if params['only-unseen']
          notif_groups = @account.notifications_unseen_grouped.take(n)
        else
          notif_groups = @account.notifications.take(n).map { |notif| [notif] }
        end

        notif_groups.map { |group|
          group.map { |notif|
            h = {
              id: notif.id,
              seen: notif.seen,
              ago: Libertree::Age.ago(notif.time_created),
            }

            case notif.subject
            when Libertree::Model::Comment
              comment = notif.subject
              account = comment.post.member.account

              h.merge!(
                type: 'comment',
                glimpse: CGI.escape_html(comment.post.glimpse),
                link: "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}",  # TODO: DRY up with Ramaze helper method comment_link
                # member: {
                actor: {
                  id: comment.member.id,
                  handle: comment.member.handle,
                  nameDisplay: comment.member.name_display,
                },
                post: {
                  member: {
                    accountId: account ? account.id: nil,
                    nameDisplay: comment.post.member.name_display
                  }
                }
              )
            when Libertree::Model::CommentLike
              # partial = '_comment_like'
              # avatar_member = notif.subject.member
              # glimpse = notif.subject.comment.glimpse
              h.merge!(
                type: 'comment-like',
                glimpse: CGI.escape_html(comment.post.glimpse),
                link: "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}",  # TODO: DRY up with Ramaze helper method comment_link
                actor: {
                  id: comment.member.id,
                  handle: comment.member.handle,
                  nameDisplay: comment.member.name_display,
                },
                post: {
                  member: {
                    accountId: account ? account.id: nil,
                    nameDisplay: comment.post.member.name_display
                  }
                }
              )
            when Libertree::Model::Message
              # partial = '_message'
              # avatar_member = notif.subject.sender
              # glimpse = notif.subject.glimpse
            when Libertree::Model::PoolPost
              # partial = '_pool_post'
              # avatar_member = notif.subject.pool.member
              # glimpse = notif.subject.post.glimpse
            when Libertree::Model::PostLike
              # partial = '_post_like'
              # avatar_member = notif.subject.member
              # glimpse = notif.subject.post.glimpse
            when Libertree::Model::Post
              # partial = '_mention'
              # avatar_member = notif.subject.member
              # glimpse = notif.subject.glimpse
            end
          }
        }
      end
    end
  end
end
