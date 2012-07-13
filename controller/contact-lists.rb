module Controller
  class ContactLists < Base
    map '/contact-lists'

    before_all do
      require_login
    end

    def index
      @lists = account.contact_lists
    end

    def create
      redirect_referrer  if ! request.post?

      list = Libertree::Model::ContactList.create(
        name: request['name'].to_s,
        account_id: account.id
      )

      flash[:notice] = %{Contact list "#{list.name}" created.}

      redirect_referrer
    end
  end
end
