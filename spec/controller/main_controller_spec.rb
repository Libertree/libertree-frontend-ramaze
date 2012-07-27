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

  context 'when an account exists' do
    before :each do
      @account = Libertree::Model::Account.create( FactoryGirl.attributes_for(:account) )
      @account.password = 'testpass'
    end

    it 'authenticates with good credentials' do
      visit '/login'
      fill_in 'username', :with => @account.username
      fill_in 'password', :with => 'testpass'
      click_on 'Login'

      page.should have_content('by post time')
      page.should have_content('River:')
    end
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
