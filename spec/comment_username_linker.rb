require 'redcarpet'
require 'factory_girl'
require 'rspec'

require_relative 'factories.rb'
require_relative '../helper/comment'
require_relative '../lib/libertree/render'
require_relative '../lib/libertree/markdown'

describe Ramaze::Helper::Comment do
  before :each do
    @s = Object.new.extend(subject)

    @server = Libertree::Model::Server.create( FactoryGirl.attributes_for(:server) )
    @author = Libertree::Model::Member.create(
      FactoryGirl.attributes_for(:member, :username => "John Lennon", :server_id => @server.id)
    )
    @paul = Libertree::Model::Member.create(
      FactoryGirl.attributes_for(:member, :username => "Paul McCartney", :server_id => @server.id)
    )
    @george = Libertree::Model::Member.create(
      FactoryGirl.attributes_for(:member, :username => "George Harrison", :server_id => @server.id)
    )
    @george2 = Libertree::Model::Member.create(
      FactoryGirl.attributes_for(:member, :username => "George Benson", :server_id => @server.id)
    )
    @post = Libertree::Model::Post.create(
      FactoryGirl.attributes_for(:post, :member_id => @author.id)
    )
  end

  describe '#comment_text_rendered_and_participants_linked' do
    context 'with more than one comment' do
      it 'should turn @name into a link to last comment by user name' do
        Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @george.id,
                                     :post_id => @post.id,
                                     :text => "Very interesting."))
        comment = Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @paul.id,
                                     :post_id => @post.id,
                                     :text => "@George Harrison: indeed. I thought you'd like that."))

        processed = @s.comment_text_rendered_and_participants_linked(comment)
        processed.should =~ /data-member-id="#{@george.id}"/
      end

      it 'should replace partial matches that are longer than 2 characters' do
        Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @george.id,
                                     :post_id => @post.id,
                                     :text => "Very interesting."))
        comment = Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @paul.id,
                                     :post_id => @post.id,
                                     :text => "@George: indeed. I thought you'd like that."))

        processed = @s.comment_text_rendered_and_participants_linked(comment)
        processed.should =~ /data-member-id="#{@george.id}"/
      end

      it 'should replace names irrespective of case' do
        Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @george.id,
                                     :post_id => @post.id,
                                     :text => "Very interesting."))
        comment = Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @paul.id,
                                     :post_id => @post.id,
                                     :text => "@george: indeed. I thought you'd like that."))
        processed = @s.comment_text_rendered_and_participants_linked(comment)
        processed.should =~ /data-member-id="#{@george.id}"/
      end

      it 'should match only the most recent name in ambiguous situations' do
        Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @george.id,
                                     :post_id => @post.id,
                                     :text => "Very interesting."))
        Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @george2.id,
                                     :post_id => @post.id,
                                     :text => "Very interesting, indeed."))
        comment = Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @paul.id,
                                     :post_id => @post.id,
                                     :text => "@george: I mean you, George Benson."))

        processed = @s.comment_text_rendered_and_participants_linked(comment)
        processed.should =~ /data-member-id="#{@george2.id}"/
        processed.should_not =~ /data-member-id="#{@george.id}"/
      end
    end

    context 'with less than two comments' do
      it 'should not do anything on the first comment' do
        comment = Libertree::Model::Comment.create(
          FactoryGirl.attributes_for(:comment,
                                     :member_id => @paul.id,
                                     :post_id => @post.id,
                                     :text => "@George: hope you find this interesting."))

        processed = @s.comment_text_rendered_and_participants_linked(comment)
        processed.should == comment.text_rendered
      end
    end

  end
end
