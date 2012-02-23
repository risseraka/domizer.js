function domizer(_) {
    _ = _ || {};

    var is = (function constructor() {
        function buildTypeFunc(type) {
            return function isType(obj) {
                return Object.prototype.toString.call(obj) === "[object " + type + "]";
            };
        }

        var that = {},
            types = ["Array", "RegExp", "Date", "Number", "String", "Object", "Function"],
            i;

        for (i = types.length - 1; i >= 0; i -= 1) {
            that[types[i]] = buildTypeFunc(types[i]);
        }
        return that;
    }());

    function feach(obj, func) {
        if (obj === undefined) {
            return;
        }
        if (is.Array(obj)) {
            return obj.forEach(func);
        } else if (is.Object(obj)) {
            var key;

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    func(obj[key], key, obj);
                }
            }
            return;
        }
        throw "Illegal forEach on non object nor array variable";
    }

    function flatten(arr, result) {
        return arr.reduce(
            function (result, el) {
                if (is.Array(el)) {
                    result = flatten(el, result);
                } else {
                    result.push(el);
                }
                return result;
            },
            result || []
        );
    }

    function merge(obj1, obj2) {
        feach(obj2,
            function merging(value, key) {
                obj1[key] = value;
            }
        );
        return obj1;
    }

    function getIfType(obj, type) {
        return is[type](obj) ? obj : undefined;
    }

    function argSlice(args, count) {
        return Array.prototype.slice.call(args, count);
    }

    var tags = [
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

    function renderAttributes(options) {
        var attributes = [];

        feach(options,
            function parsing(value, key) {
                attributes.push(key +
                    (value !== undefined ?
                            "=\"" + value + "\"" : ""));
            }
        );
        return attributes;
    }

    function DomizerObj(tag, attributes, content) {
        function render() {
            attributes = attributes ?
                renderAttributes(attributes).join(" ") : "";
            content = content ? content.join("") : "";

            return [
                "<", tag,
                attributes ? " " + attributes : "",
                content ? ">" + content + "</" + tag : "/",
                ">"
            ].join("");
        }
        this.toString = render;
    }

    function getObjIfNonDomizerObj(el) {
        var el = getIfType(el, "Object");

        if (!(el instanceof DomizerObj)) {
            return el;
        }
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

            feach(merge({}, tagOptions), function filling(value, key) {
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
                    .concat(argSlice(arguments, skip)));
        };
    }

    _.extendTag = extendTag;

    _.image = extendTag(_.img, {"src": ""});

    _.linkTo = extendTag(_.a, {"href": ""});

    _.javascript = extendTag(_.script, {"type": "text/Javascript", "src": ""});

    return _;
}