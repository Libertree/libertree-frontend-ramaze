module Controller
  class ContactLists < Base
    map '/contact-lists'
    before_all do
      default_before_filter
    end

    provide(:json, type: 'application/json') { |action,value| value.to_json }

    def index
      @lists = account.contact_lists
      @all_members = Libertree::Model::Member.all.sort_by { |m| m.name_display.downcase }
      @all_members.delete(account.member)
    end

    def create
      redirect_referrer  if ! request.post?

      if request['name'].to_s.empty?
        error = _('Contact list name may not be empty.')
        if Ramaze::Current.action.wish == 'json'
          {
            'status' => 'error',
            'msg'    => error,
          }
        else
          flash[:error] = error
          redirect_referrer
        end
      end

      list = Libertree::Model::ContactList.create(
        name: request['name'].to_s,
        account_id: account.id
      )
      list.members = request['members']  # TODO: Can this be hacked?
      if request['intro']
        Libertree::Model::River.create(
          account_id: account.id,
          label: s_('intro-contact-list-name|Friends'),
          query: ":contact-list \"#{list.name}\"",
          home: false,
        )
      end

      if Ramaze::Current.action.wish == 'json'
        { 'status' => 'success' }
      else
        redirect r(:show, list.id)
      end
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

      @list.members = request['members']  # TODO: Can this be hacked?
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
