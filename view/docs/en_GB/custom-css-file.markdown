# Custom CSS File
You can copy paste the code below into your settings. Please put behind the semicolons a number in hexadecimal for the color. This file is dedicated to average users, if you are familiar with CSS please take a look at the application.scss-file for advanced changes of the Libertree interface.

## Changes to the Inteface
In this picture you can see the changes of the custom css file.

![Picture with notations](link_to_the_picture)

* 1.) The background is now black
* 2.) The links are also black
* 3.) The main menu bar is now white
* 4.) The avatar picture is now bigger

## CSS File

~~~
/* THIS IS THE EXAMPLE-CSS-FILE FOR LIBERTREE */

/* Hint: If you want to change the colors, you have to edit the hexadecimal numbers #000000 and #ffffff */

/* In this section you can put a picture-link in for the background and you can choose a color if you picture doesn't cover the whole area */

body {
    padding: 0px;
    margin: 0px;
    background: url("www.please-replace-this-link.org/example-picture.png") fixed center repeat-x #000000;
    width: 100%;
}

/* In this section you can change the color of the main menu bar. */

/* Hint: Please mind that it is not possible to change the color of the icons. You should choose a color that fits to the icon color. */

.menu {
    background: #ffffff;
}

/* In this section you can change the menu from the upper right corner */

.window {
    background-color: #ffffff;
}

/* In this section you can change the color of your username and make it bigger. */

#menu-narrower #menu-account {
    font-size: 12pt; color: #000000;
}

/* In this section you can change the color of the links */

a {
    color: #000000; border-bottom: 1px dotted;
}

a:visited {
    color: #000000;
}

a:hover {
    color: #000000;
}

a:active {
    color: #000000;
}

/* In this section you can change the background color of your chat */

#chat-window {
    background-color: #ffffff;
}
~~~
