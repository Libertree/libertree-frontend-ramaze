require 'spec_helper'

describe 'main', :type => :request, :js => true do
  before :all do
    $skip_authentication = false
  end

  it 'requires successful authentication' do
    visit '/'
    page.should have_content('Username')
    page.should have_content('Password')
    page.should have_button('Login')
  end

  it 'authenticates with good credentials' do
    pending
    visit '/login'
    fill_in 'name', :with => 'wildfire'
    fill_in 'password', :with => 'fildwire'
    click_on 'Login'

    page.should have_content('Welcome to the Super Sports cars website')
  end

  it 'rejects bad credentials' do
    pending
    visit '/login'
    fill_in 'name', :with => 'nosuchuser'
    fill_in 'password', :with => 'somepassword'
    click_on 'Login'

    page.should have_no_content('Welcome to the Super Sports cars website')
    page.should have_content('Invalid credentials')
  end
end
