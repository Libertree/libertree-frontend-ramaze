# encoding: utf-8

require 'redcarpet'
require 'nokogiri'
require_relative '../lib/libertree/render'
require_relative '../lib/libertree/markdown'

describe Libertree do
  describe '#hashtaggify' do
    it 'should linkify hashtags' do
      subject.hashtaggify('#simple').should == '<a class="hashtag" data-hashtag="simple">#simple</a>'
      subject.hashtaggify('#99bottles').should == '<a class="hashtag" data-hashtag="99bottles">#99bottles</a>'
      subject.hashtaggify('#number1').should == '<a class="hashtag" data-hashtag="number1">#number1</a>'
      subject.hashtaggify('#hash-tag').should == '<a class="hashtag" data-hashtag="hash-tag">#hash-tag</a>'
      subject.hashtaggify('#hash_tag').should == '<a class="hashtag" data-hashtag="hash_tag">#hash_tag</a>'
      subject.hashtaggify('surrounding #simple words').should == 'surrounding <a class="hashtag" data-hashtag="simple">#simple</a> words'
      subject.hashtaggify('surrounding #simple').should == 'surrounding <a class="hashtag" data-hashtag="simple">#simple</a>'
      subject.hashtaggify('#simple words').should == '<a class="hashtag" data-hashtag="simple">#simple</a> words'
      subject.hashtaggify('#multiple foo #hashtags bar').should == '<a class="hashtag" data-hashtag="multiple">#multiple</a> foo <a class="hashtag" data-hashtag="hashtags">#hashtags</a> bar'
      subject.hashtaggify('#multiple #hashtags').should == '<a class="hashtag" data-hashtag="multiple">#multiple</a> <a class="hashtag" data-hashtag="hashtags">#hashtags</a>'
    end

    it 'should linkify unicode hashtags' do
      subject.hashtaggify('#中国').should == '<a class="hashtag" data-hashtag="中国">#中国</a>'
    end

    it 'should not linkify apparent hashtags with invalid characters' do
      subject.hashtaggify('#<3').should == '#<3'
      subject.hashtaggify('#ab|c').should == '<a class="hashtag" data-hashtag="ab">#ab</a>|c'
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
      subject.render('#simple').should == Nokogiri::HTML::fragment(%{<p><a class="hashtag" data-hashtag="simple">#simple</a></p>\n}).to_xhtml
    end

    it 'should linkify hashtags in headings' do
      subject.render('# A #simple heading').should == Nokogiri::HTML::fragment(%{<h1>A <a class="hashtag" data-hashtag="simple">#simple</a> heading</h1>\n}).to_xhtml
    end

    it 'should not linkify hashtags in code blocks' do
      subject.render('`#simple`').should == Nokogiri::HTML::fragment(%{<p><code>#simple</code></p>}).to_xhtml
    end

    it 'should linkify hashtags up to, but excluding, invalid characters.' do
      subject.render('#ab_c').should == Nokogiri::HTML::fragment(%{<p><a class="hashtag" data-hashtag="ab">#ab</a>_c</p>\n}).to_xhtml
    end

    it 'should not linkify hashtag edge cases' do
      subject.render(nil).should == ''
      subject.render('').should == ''
    end
  end
end
