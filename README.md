### Domizer.js - Functional HTML builder in JavaScript.

Disclaimer:
This HTML builder has been inspired by http://joelhughes.co.uk/lmjs-wirte-html-in-javascript-using-less-mark
which originally was inspired by http://trapm.com/vana-templating-an-utterly-sensible-templatin.

I simply tried to get the functional idea back into the tool without it to become too blotted.

Use:

    var builder = domizer({}),
        html = builder.div({"class": "myClass"}, "This is pretty easy!");
    
    console.log(html.toString());