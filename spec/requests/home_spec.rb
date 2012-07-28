require 'spec_helper'

describe 'a local member', :type => :request, :js => true do
  include_context 'logged in'

  context 'when there are no posts on the local server' do
    it 'sees the home page tools, and no posts' do
      visit '/home'

      page.should have_content('River:')
      page.should have_content('manage rivers')
      page.should have_content('by post time')
      page.should have_content('by update time')

      page.should have_no_content('ago')
    end
  end

  context 'given some existing posts' do
    before :each do
      @posts = []
      @account2 = Libertree::Model::Account.create( FactoryGirl.attributes_for(:account) )
      5.times do |i|
        @posts << Libertree::Model::Post.create(
          FactoryGirl.attributes_for( :post, member_id: @account2.member.id, text: "Test post number #{i}." )
        )
      end
    end

    it 'sees some of the posts' do
      visit '/home'
      using_wait_time(3) do
        page.should have_content('Test post number 4.')
        page.should have_content('Test post number 3.')
        page.should have_content('seconds ago')
      end
    end
  end
end
