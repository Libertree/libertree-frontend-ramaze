require 'spec_helper'

describe 'Controller::API::V1::Posts', :type => :feature do
  include_context 'rack-test'

  before :each do
    @account = Libertree::Model::Account.create( FactoryGirl.attributes_for(:account) )
    @account.api_token = 'secrettoken'
  end

  it '#create' do
    Libertree::DB.dbh.execute 'TRUNCATE posts CASCADE'
    expect(Libertree::Model::Post.all.count).to eq 0

    post '/api/v1/posts/create', 'token' => 'secrettoken', 'text' => 'A new post.', 'source' => 'foobar'

    expect(last_response.status).to eq 200
    expect(Libertree::Model::Post.all.count).to eq 1

    response = last_response.body
    json = JSON.parse(response)
    expect(json['success']).to eq true
    expect(json['id']).to be_kind_of Fixnum
  end
end
