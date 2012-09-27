# encoding: utf-8

require 'spec_helper'

describe Libertree do
  describe '#render' do
    it 'should escape XHTML tags' do
      subject.render('<script>alert("hello world")</script>').should =~ /<p>alert\(.hello world.\)<\/p>/
    end

    it 'should not strip tags in code blocks' do
      subject.render('`<span>tag soup</span>`').should =~ /&lt;span&gt;tag soup&lt;\/span&gt;/
    end

    it 'should not introduce extra space at the beginning of code blocks' do
      subject.render(%{head

      6 spaces before
    4 spaces before
       7 spaces before

tail}).should == %{<p>head</p>

<pre><code>  6 spaces before
4 spaces before
   7 spaces before
</code></pre>

<p>tail</p>}
    end

    it 'should autolink relative URLs' do
      url = "/posts/show/1234"
      subject.render(url).should =~ %r{<a href="#{url}">#{url}</a>}

      # should also work in lists
      subject.render("- #{url}").should =~ %r{<a href="#{url}">#{url}</a>}

      url = "/posts/show/987/123#comment-123"
      subject.render(url).should =~ %r{<a href="#{url}">#{url}</a>}
    end

    it 'should not mangle underscores in URLs' do
      subject.render('http://this_is_too_cool.com').should =~ %r{this_is_too_cool}
    end

    it 'should ignore hashtags in links' do
      subject.render('[this is not a #valid hashtag](http://elephly.net)').should == '<p><a href="http://elephly.net">this is not a #valid hashtag</a></p>'
    end

  end
end
