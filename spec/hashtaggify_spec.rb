require 'redcarpet'
require_relative '../lib/libertree/render'

describe Libertree do
  describe '#hashtaggify' do
    it 'should linkify hashtags' do
      subject.hashtaggify('#simple').should == '<a class="hashtag" data-hashtag="simple">#simple</a>'
      subject.hashtaggify('#99bottles').should == '<a class="hashtag" data-hashtag="99bottles">#99bottles</a>'
      subject.hashtaggify('#number1').should == '<a class="hashtag" data-hashtag="number1">#number1</a>'
      subject.hashtaggify('#hash-tag').should == '<a class="hashtag" data-hashtag="hash-tag">#hash-tag</a>'
      subject.hashtaggify('surrounding #simple words').should == 'surrounding <a class="hashtag" data-hashtag="simple">#simple</a> words'
      subject.hashtaggify('surrounding #simple').should == 'surrounding <a class="hashtag" data-hashtag="simple">#simple</a>'
      subject.hashtaggify('#simple words').should == '<a class="hashtag" data-hashtag="simple">#simple</a> words'
      subject.hashtaggify('#multiple foo #hashtags bar').should == '<a class="hashtag" data-hashtag="multiple">#multiple</a> foo <a class="hashtag" data-hashtag="hashtags">#hashtags</a> bar'
      subject.hashtaggify('#multiple #hashtags').should == '<a class="hashtag" data-hashtag="multiple">#multiple</a> <a class="hashtag" data-hashtag="hashtags">#hashtags</a>'
    end

    it 'should not linkify apparent hashtags with invalid characters' do
      subject.hashtaggify('#ab_c').should == '#ab_c'
      subject.hashtaggify('#<3').should == '#<3'
    end

    it 'should not linkify hashtag edge cases' do
      subject.hashtaggify(nil).should == ''
      subject.hashtaggify('').should == ''
    end

    it 'should treat hashtags as case-insensitive' do
      subject.hashtaggify('#FooBar').should == '<a class="hashtag" data-hashtag="foobar">#FooBar</a>'
    end
  end

  describe '#render' do
    it 'should linkify hashtags' do
      subject.render('#simple').should == %{<p><a class="hashtag" data-hashtag="simple">#simple</a></p>\n}
    end

    it 'should not linkify apparent hashtags with invalid characters' do
      subject.render('#ab_c').should == "<p>#ab_c</p>\n"
    end

    it 'should not linkify hashtag edge cases' do
      subject.render(nil).should == ''
      subject.render('').should == ''
    end
  end
end
