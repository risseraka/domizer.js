/*global document, HTMLElement*/

function domizer(_) {
    _ = _ || {};

    var is = {
      Array: function(obj) {
        return obj instanceof Array;
      },
      Object: function(obj) {
        return typeof obj === "object";
      }
    },
    tags = [
        "a", "abbr", "address", "area", "article", "aside", "audio",
        "b", "base", "bdo", "blockquote", "body", "br", "button", "canvas",
        "caption", "cite", "code", "col", "colgroup", "command", "datalist",
        "dd", "del", "details", "dfn", "div", "dl", "dt", "em", "embed",
        "eventsource", "fieldset", "figcaption", "figure", "footer", "form", "h1",
        "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html",
        "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend",
        "li", "link", "mark", "html-map", "menu", "html-meta", "meta", "meter",
        "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p",
        "param", "pre", "progress", "q", "ruby", "rp", "rt", "samp", "script",
        "section", "select", "small", "source", "span", "strong", "style", "sub",
        "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th",
        "thead", "html-time", "title", "tr", "ul", "video", "wbr"
    ];

    function feach(obj, func) {
        if (is.Array(obj)) {
            return obj.forEach(func);
        }
        if (is.Object(obj)) {
            return Object.keys(obj).forEach(function(key) {
                func(obj[key], key, obj);
            });
        }
        throw "Illegal forEach on non object nor array variable";
    }

    function flatten(obj) {
        return is.Array(obj) ?
            obj.reduce(
                function flattening(result, el) {
                    return result.concat(flatten(el));
                },
                []
            ) :
            obj;
    }

    function merge(obj1, obj2) {
        feach(obj2, function merging(value, key) {
            obj1[key] = value;
        });
        return obj1;
    }

    // thx @webreflection
    var argSlice = Array.prototype.slice.call.bind(Array.prototype.slice);

    function renderAttributes(options) {
        var attributes = [];

        feach(options, function parsing(value, key) {
            attributes.push(key +
                (value !== undefined ?
                        "=\"" + value + "\"" : ""));
        });
        return attributes;
    }

    function renderContent(content) {
        return content.reduce(
            function (result, value) {
                if (value instanceof HTMLElement) {
                    return result + value.outerHTML;
                }
                return result + value;
            },
            ""
        );
    }

    function DomizerObj(tag, attrs, contents) {
        function render() {
            var attributes = attrs ?
                    renderAttributes(attrs).join(" ") : "",
                content = contents ? renderContent(contents) : "";

            return "<" + tag +
                (attributes ? " " + attributes : "") +
                (content ? ">" + content + "</" + tag : "/") +
                ">";
        }

        function dom() {
            var el = document.createElement(tag);

            attrs && feach(attrs, function (value, key) {
                el.setAttribute(key, value);
            });
            if (is.Array(contents)) {
                contents.reduce(
                    function (el, value) {
                        el.appendChild(
                          (value instanceof HTMLElement && value) ||
                          (value instanceof DomizerObj && value.dom()) ||
                          document.createTextNode(value)
                        );
                        return el;
                    },
                    el
                );
            }
            return el;
        }

        this.toString = render;
        this.dom = dom;
    }

    function getObjIfNonDomizerObj(el) {
        return (el instanceof DomizerObj || !is.Object(el)) ? undefined : el;
    }

    function buildTag(el) {
        return function domizerTag() {
            var options = getObjIfNonDomizerObj(arguments[0]),
                content = flatten(argSlice(arguments, options ? 1 : 0));

            content = content.length > 0 ? content : undefined;
            return new DomizerObj(el, options, content);
        };
    }

    _["!DOCTYPE"] = function domizerDoctypeTag() {
        var options = getObjIfNonDomizerObj(arguments[0]),
            attributes = options ? renderAttributes(options) : [],
            html = argSlice(arguments, (options ? 1 : 0)).join("");

        return "<!DOCTYPE" +
            (attributes.length > 0 ? " " + attributes.join(" ") : "") +
            ">" + html;
    };

    feach(tags, function buildingTags(tag) {
        _[tag] = buildTag(tag);
    });

    function extendTag(tag, tagOptions) {
        return function domizerExtendedTag() {
            var args = arguments,
                skip = 0,
                obj = {},
                options;

            feach(merge(obj, tagOptions), function filling(value, key) {
                if (value === "") {
                    obj[key] = args[skip];
                    skip += 1;
                }
            });
            options = getObjIfNonDomizerObj(args[skip]);
            if (options === undefined) {
                options = {};
            } else {
                skip += 1;
            }
            return tag.apply(
                this,
                [merge(options, obj)]
                    .concat(argSlice(arguments, skip))
            );
        };
    }

    _.extendTag = extendTag;

    _.image = extendTag(_.img, {"src": ""});

    _.linkTo = extendTag(_.a, {"href": ""});

    _.javascript = extendTag(_.script, {"type": "text/Javascript", "src": ""});

    return _;
}
