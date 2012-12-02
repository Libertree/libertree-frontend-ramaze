# encoding: utf-8

require 'spec_helper'

describe Libertree do
  describe '#render' do
    it 'should escape XHTML tags' do
      subject.render('<script>alert("hello world")</script>').should == ""
    end

    it 'should not strip tags in code blocks' do
      subject.render('`<span>tag soup</span>`').should =~ /&lt;span&gt;tag soup&lt;\/span&gt;/
    end

    it 'should render strike-through markup' do
      subject.render('~~good~~ bad').should == "<p><del>good</del> bad</p>"
    end

    it 'should not break hashtags in parentheses' do
      subject.render('(#simple)').should =~ %r{(<a href="/tags/simple" class="hashtag">#simple</a>)}
      subject.render('Hashtag (#simple).').should == '<p>Hashtag (<a href="/tags/simple" class="hashtag">#simple</a>).</p>'
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

    it 'should not be confused when a URL contains parens' do
      subject.render("[Selig](http://en.wikipedia.org/wiki/Selig_(band)) wrote most of the stuff for [Echt](http://en.wikipedia.org/wiki/Echt_(band))").should == "<p><a href=\"http://en.wikipedia.org/wiki/Selig_(band)\">Selig</a> wrote most of the stuff for <a href=\"http://en.wikipedia.org/wiki/Echt_(band)\">Echt</a></p>"
    end

    it 'should autolink relative URLs in lists' do
      url = "http://libertreeproject.org"
      subject.render("- #{url}").should =~ %r{<a href="#{url}">#{url}</a>}
    end

    it 'should not hashtaggify parts of relative URLs' do
      url = "/posts/show/987/123/#comment-123"
      subject.render(url).should =~ %r{<a href="#{url}">#{url}</a>}

      url = "/posts/show/987/123#comment-123"
      subject.render(url).should =~ %r{<a href="#{url}">#{url}</a>}
    end

    it 'should autolink absolute URLs' do
      url = "http://libertreeproject.org"
      subject.render(url).should =~ %r{<a href="#{url}">#{url}</a>}

      # should also work in lists
      subject.render("- #{url}").should =~ %r{<a href="#{url}">#{url}</a>}
    end

    it 'should not mangle underscores in URLs' do
      subject.render('http://this_is_too_cool.com').should =~ %r{this_is_too_cool}
    end

    it 'should ignore hashtags in links' do
      subject.render('[this is not a #valid hashtag](http://elephly.net)').should == '<p><a href="http://elephly.net">this is not a #valid hashtag</a></p>'
    end

  end

  describe '#autolinker' do
    it 'should autolink relative URLs' do
      url = "/posts/show/1234"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}

      url = "/posts/show/1234/"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}

      url = "/posts/show/1234/123"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}

      url = "/posts/show/1234/123/"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}

      url = "/posts/show/987/123#comment-123"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}

      url = "/posts/show/987/123/#comment-123"
      subject.autolinker(url).should == %{<a href='#{url}'>#{url}</a>}
    end
  end
end
