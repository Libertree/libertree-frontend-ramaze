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
          notifs = @account.notifications_unseen.take(n)
        else
          notifs = @account.notifications.take(n)
        end

        # TODO:
        # notifs = account.notifications.find_all {|n| n.subject }
        # @grouped_notifs = notifs.map {|n| [n]}
        # /TODO

        notifs.map { |notif|
          h = {
            seen: notif.seen,
            actorName: notif.subject.member.name_display,  # TODO: is this redundant with the member hash below?
            ago: Libertree::Age.ago(notif.time_created),
            member: {
              id: notif.subject.member.id,
              handle: notif.subject.member.handle,
              nameDisplay: notif.subject.member.name_display,
            },
          }

          if notif.subject.respond_to?(:glimpse)
            comment = notif.subject
            h.merge!(
              glimpse: CGI.escape_html(comment.glimpse),
              link: "/posts/show/#{comment.post.id}/#{comment.id}#comment-#{comment.id}",  # TODO: DRY up with Ramaze helper method comment_link
            )
          end

          if notif.subject.respond_to?(:post)
            account = notif.subject.post.member.account
            h.merge!(
              post: {
                member: {
                  accountId: account ? account.id: nil,
                  nameDisplay: notif.subject.post.member.name_display
                }
              }
            )
          end

          [h]
        }
      end
    end
  end
end
