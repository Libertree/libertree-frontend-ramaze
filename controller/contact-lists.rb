module Controller
  class ContactLists < Base
    map '/contact-lists'

    before_all do
      require_login
      init_locale
    end

    def index
      @lists = account.contact_lists
    end

    def create
      redirect_referrer  if ! request.post?
      if request['name'].to_s.empty?
        flash[:error] = _('Contact list name may not be empty.')
        redirect_referrer
      end

      list = Libertree::Model::ContactList.create(
        name: request['name'].to_s,
        account_id: account.id
      )

      redirect r(:show, list.id)
    end

    def show(contact_list_id)
      @list = Libertree::Model::ContactList[
        account_id: account.id,
        id: contact_list_id.to_i
      ]
      if @list.nil?
        respond "404: Not Found", 404
      end
      @all_members = Libertree::Model::Member.all.sort_by { |m| m.name_display.downcase }
      @all_members.delete(account.member)
    end

    def update(contact_list_id)
      redirect_referrer  if ! request.post?

      if request['name'].to_s.empty?
        flash[:error] = _('Contact list name may not be empty.')
        redirect_referrer
      end

      @list = Libertree::Model::ContactList[
        account_id: account.id,
        id: contact_list_id.to_i
      ]
      if @list.nil?
        respond "404: Not Found", 404
      end

      @list.members = request['members']
      if @list.members.delete(account.member)
	flash[:error] = _('Contact list may not contain yourself.')
	redirect_referrer
      end

      @list.name = request['name'].to_s

      flash[:notice] = _('Contact list updated.')
      redirect r(:/)
    end

    def destroy(contact_list_id)
      contact_list = Libertree::Model::ContactList[
        account_id: account.id,
        id: contact_list_id.to_i
      ]
      if contact_list
        name = contact_list.name
        contact_list.delete_cascade
        flash[:notice] = _('The contact list &ldquo;%s&rdquo; has been deleted.') % name
      end
      redirect_referrer
    end

    def add_member(contact_list_id, member_id)
      contact_list = Libertree::Model::ContactList[
        account_id: account.id,
        id: contact_list_id.to_i
      ]
      member = Libertree::Model::Member[ member_id.to_i ]
      if contact_list && member
        contact_list << member
      end
      redirect_referrer
    end
  end
end
