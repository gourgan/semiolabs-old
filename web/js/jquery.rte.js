/*
 * jQuery RTE plugin 0.5.1 - create a rich text form for Mozilla, Opera, and Internet Explorer
 *
 * Copyright (c) 2009 Batiste Bieler
 * Distributed under the GPL License.
 * Distributed under the MIT License.
 *
 * Modified by Kamran Ayub (3/26/2010)
 * http://intrepidstudios.com/
 * Icons courtesy of FamFamFam Silk Icon set: http://www.famfamfam.com/lab/icons/silk/
 */

// define the rte light plugin
(function ($) {

    if (typeof $.fn.rte === "undefined") {

        var defaults = {
            content_css_url: "rte.css",
            media_url: "images",
            dot_net_button_class: null,
            max_height: 350
        };

        $.fn.rte = function (options) {

            //
            // get html from iframe
            //
            $.fn.rte.html = function (iframe) {
                return iframe.contentWindow.document.getElementsByTagName("body")[0].innerHTML;
            };

            //
            // build main options before element iteration
            //
            var opts = $.extend(defaults, options);

            //
            // iterate and construct the RTEs
            //
            return this.each(function () {

                var textarea = $(this);
                var iframe;
                var myID = textarea.attr("id");

                // element specific options
                var settings = $.meta ? $.extend({}, opts, textarea.data()) : opts;



                // selectors
                var sel = {
                    cmdBtnSelector: "." + settings.dot_net_button_class
                };

                //
                // enable design mode
                //
                function enableDesignMode() {

                    var content = textarea.val();

                    // Mozilla needs this to display caret
                    if ($.trim(content) == '') {
                        content = '<br />';
                    }

                    // already created? show/hide
                    if (iframe) {
                        textarea.hide();
                        $(iframe).contents().find("body").html(content);
                        $(iframe).show();
                        $("#toolbar-" + myID).remove();
                        textarea.before(toolbar());
                        return true;
                    }

                    // need to be created this way
                    iframe = document.createElement("iframe");
                    iframe.frameBorder = 0;
                    iframe.frameMargin = 0;
                    iframe.framePadding = 0;
                    iframe.height = 200;
                    if (textarea.attr('class'))
                        iframe.className = textarea.attr('class');
                    if (textarea.attr('id'))
                        iframe.id = myID;
                    if (textarea.attr('name'))
                        iframe.title = textarea.attr('name');

                    textarea.after(iframe);

                    var css = "";
                    if (settings.content_css_url) {

                        css = "<link type='text/css' rel='stylesheet' href='" + settings.content_css_url + "' />";
                    }

                    var doc = "<html><head>" + css + "</head><body class='frameBody'>" + content + "</body></html>";

                    tryEnableDesignMode(doc, function () {

                        $("#toolbar-" + myID).remove();
                        textarea.before(toolbar());

                        // hide textarea
                        textarea.hide();

                    });

                }

                function tryEnableDesignMode(doc, callback) {
                    if (!iframe) { return false; }

                    try {
                        iframe.contentWindow.document.open();
                        iframe.contentWindow.document.write(doc);
                        iframe.contentWindow.document.close();
                    } catch (error) {
                        console.log(error)
                    }
                    if (document.contentEditable) {
                        iframe.contentWindow.document.designMode = "On";
                        callback();
                        return true;
                    }
                    else if (document.designMode != null) {
                        try {
                            iframe.contentWindow.document.designMode = "on";
                            callback();
                            return true;
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    setTimeout(function () { tryEnableDesignMode(doc, callback) }, 250);
                    return false;
                }

                function disableDesignMode(submit) {
                    var content = $(iframe).contents().find("body").html();

                    if ($(iframe).is(":visible")) {
                        textarea.val(content);
                    }

                    if (submit !== true) {
                        textarea.show();
                        $(iframe).hide();
                    }
                }

                //
                // create toolbar
                //
                function toolbar() {
					var chemin = '/semiolabs/web/images/';
                    var tb = $("<div class='rte-toolbar' id='toolbar-" + myID + "'><div class='command_container'>\
		            <p id='typePara'>\
		                <select>\
		                    <option value=''>Block style</option>\
		                    <option value='p'>Paragraph</option>\
		                    <option value='h3'>Title</option>\
		                </select>\
		            </p>\
		            <p id='gras'>\
		                <a href='#' class='bold'><img src='" + chemin + "text_bold.png' alt='bold' title='Bold' /></a>\
		                <a href='#' class='italic'><img src='" + chemin + "text_italic.png' alt='italic' title='Italicize' /></a>\
		            </p>\
		            <p id='autres'>\
		                <a href='#' class='unorderedlist'><img src='" + chemin + "text_list_bullets.png' alt='unordered list' title='Unordered List' /></a>\
		                <a href='#' class='link'><img src='" + chemin + "link.png' alt='link' title='Hyperlink' /></a>\
		                <a href='#' class='image'><img src='" + chemin + "image.png' alt='image' title='Image' /></a>\
		                <a href='#' class='disable'><img src='" + chemin + "code.png' alt='close rte' title='View Code' /></a>\
		            </p></div></div>");

                    $('select', tb).change(function () {
                        var index = this.selectedIndex;
                        if (index != 0) {
                            var selected = this.options[index].value;
                            formatText("formatblock", '<' + selected + '>');
                        }
                    });
                    $('.bold', tb).click(function () { formatText('bold'); return false; });
                    $('.italic', tb).click(function () { formatText('italic'); return false; });
                    $('.unorderedlist', tb).click(function () { formatText('insertunorderedlist'); return false; });
                    $('.link', tb).click(function () {
                        var p = prompt("URL:");
                        if (p)
                            formatText('CreateLink', p);
                        return false;
                    });

                    $('.image', tb).click(function () {
                        var p = prompt("image URL:");
                        if (p)
                            formatText('InsertImage', p);
                        return false;
                    });

                    $('.disable', tb).click(function () {

                        disableDesignMode();

                        var edm = $('<a class="rte-edm" href="#">Enable design mode</a>');

                        tb.empty().append(edm);

                        edm.click(function (e) {

                            e.preventDefault();
                            enableDesignMode();

                            // remove, for good measure
                            $(this).remove();

                        });
                        return false;
                    });

                    // Attach to command clicks
                    // .NET compatability
                    if (settings.dot_net_button_class != null) {
                        var cmdBtn = $(iframe).parents('form').find(sel.cmdBtnSelector);

                        cmdBtn.click(function () {

                            disableDesignMode(true);

                        });

                    } else {
                        // Regular forms
                        $(iframe).parents('form').submit(function () {

                            disableDesignMode(true);

                        });
                    }

                    var iframeDoc = $(iframe.contentWindow.document);

                    var select = $('select', tb)[0];
                    iframeDoc.mouseup(function () {
                        setSelectedType(getSelectionElement(), select);
                        return true;
                    });
                    iframeDoc.keyup(function () {
                        setSelectedType(getSelectionElement(), select);
                        var body = $('body', iframeDoc);
                        if (body.scrollTop() > 0) {
                            var iframe_height = parseInt(iframe.style['height']);
                            if (isNaN(iframe_height)) {
                                iframe_height = 0;
                            }
                            var h = Math.min(opts.max_height, iframe_height + body.scrollTop()) + 'px';
                            iframe.style['height'] = h;
                        }
                        return true;
                    });


                    return tb;
                }

                function formatText(command, option) {
                    iframe.contentWindow.focus();
                    try {
                        iframe.contentWindow.document.execCommand(command, false, option);
                    } catch (e) { console.log(e) }
                    iframe.contentWindow.focus();
                }

                function setSelectedType(node, select) {
                    while (node.parentNode) {
                        var nName = node.nodeName.toLowerCase();
                        for (var i = 0; i < select.options.length; i++) {
                            if (nName == select.options[i].value) {
                                select.selectedIndex = i;
                                return true;
                            }
                        }
                        node = node.parentNode;
                    }
                    select.selectedIndex = 0;
                    return true;
                }

                function getSelectionElement() {
                    if (iframe.contentWindow.document.selection) {
                        // IE selections
                        selection = iframe.contentWindow.document.selection;
                        range = selection.createRange();
                        try {
                            node = range.parentElement();
                        }
                        catch (e) {
                            return false;
                        }
                    } else {
                        // Mozilla selections
                        try {
                            selection = iframe.contentWindow.getSelection();
                            range = selection.getRangeAt(0);
                        }
                        catch (e) {
                            return false;
                        }
                        node = range.commonAncestorContainer;
                    }
                    return node;
                }

                //
                // enable design mode now
                //
                enableDesignMode();

            }); //return this.each

        }; // rte

    } // if

})(jQuery);