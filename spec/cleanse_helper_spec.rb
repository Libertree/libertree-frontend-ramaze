require 'loofah'
require_relative '../helper/cleanse'

describe Ramaze::Helper::Cleanse do
  before :each do
    @c = Object.new.extend(subject)
  end

  it 'does basic cleansing' do
    @c.cleanse('a').should == 'a'
    @c.cleanse('').should == ''
    @c.cleanse(nil).should be_nil
  end

  it 'allows Markdown blockquotes' do
    @c.cleanse('> hi').should == '> hi'
    @c.cleanse(' > hi').should == ' &gt; hi'
    @c.cleanse("hello\n\n> hi").should == "hello\n\n> hi"
  end

  it 'does not allow full HTML tags' do
    @c.cleanse('<div>a</div>').should == 'a'
    @c.cleanse('<a href="foo.com">b</a>').should == 'b'
    @c.cleanse('<div\n>c</div>').should == 'c'
    @c.cleanse('<div\n\n>d</div>').should == 'd'
  end
end
