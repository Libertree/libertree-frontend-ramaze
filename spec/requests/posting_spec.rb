require 'spec_helper'

describe 'a local member', :type => :request, :js => true do
  include_context 'logged in'

  it 'can create a post' do
    visit '/posts/new'
    page.should have_content('New Post')

    fill_in 'text', with: 'Test post.'
    click_on 'Post'

    page.should have_content('Test post.')
    page.should have_content('seconds ago')
    page.should have_content(account.username)
    page.should have_content('0 comments')

    page.should have_no_content('New Post')
    page.should have_no_button('Post')
  end
end
