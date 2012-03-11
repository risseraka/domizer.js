Domizer.js - Functional HTML builder in JavaScript.
---

###Disclaimer:
This HTML builder has been inspired by
 http://joelhughes.co.uk/lmjs-wirte-html-in-javascript-using-less-mark
which originally was inspired by
 http://trapm.com/vana-templating-an-utterly-sensible-templatin.

I simply tried to get the functional idea back into the tool without it becoming too blotted.

###How to:

Build your domizer object by calling domizer().
If an optional object parameter, all tag functions will be added within:

    var myDomizer = domizer();

Domizer builder returned by domizer() should contain every single HTML tag.
Build a tag by calling its name as a function:

    var myDomizer = domizer(),
        myDiv = myDomizer.div();

Pass attributes as an object through the first argument:

    var myDomizer = domizer(),
        myDiv = myDomizer.div({
            "id": "myId",
            "class": "myClass"
        });

Content is passed as an array or a list of arguments.

    var myDomizer = domizer(),
        myDiv = myDomizer.div({
            "id": "myId",
            "class": "myClass"
        }, ["That seems pretty easy!", "Sure..."], "Umad bro?");

Get HTML text by calling toString():

    var myDomizer = domizer(),
        myDiv = myDomizer.div({
            "id": "myId",
            "class": "myClass"
        }, ["That seems pretty easy!", "Sure..."], "Umad bro?");
    
    console.log(myDiv.toString());
    // same thing as
    // console.log(myDiv + "");

    // => "<div id="myId" class="myClass">That seems pretty easy!Sure...Umad bro?</div>"

Get DOMElement by calling dom():

    var myDomizer = domizer(),
        myDiv = myDomizer.div({
            "id": "myId",
            "class": "myClass"
        }, ["That seems pretty easy!", "Sure..."], "Umad bro?");
    
    console.log(myDiv.dom());
    
    // => HTMLDivElement

Build your own tags:

    var builder = domizer({}),
        cssLink;
    
    builder.css = builder.extendTag(builder.link, {
        "type": "text/css",
        "rel": "stylesheet",
        "href": ""
    }),
    cssLink = builder.css("/css/style.css");
    
    console.log(cssLink.toString());