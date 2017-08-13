$(document).ready(function() {
    // Settings
    let SHUTTER = {
        "PADDING": { // Size of padding of container. Shutters will be touching but not entering this (px)
            "LEFT": 50,
            "RIGHT": 50
        },
        "OPEN_TIME": 500, // Full time needed for shutter to open (ms)
        "CLOSE_TIME": 500, // Full time needed for shutter to close (ms)
        "SHOW_TIME": 1000, // Opacity change time of container (ms)
        "CONTENT_SHOW_TIME": 200, // Opacity change time of content (ms)
        "BORDER_COLOR": "#00bfff", // Color of border between shutters
        "HEIGHT": 500 // Height of container (px); Width = 100%
    };
    SHUTTER.LEFT = {
        "IMAGE": {
            "SRC": "img/Shutter_left.png", // Path to image
            "WIDTH": 400, // Preferred size (px)
            "HEIGHT": 400, // Preferred size (px)
            "SHOWN_PART": 0.6 // Part of image to be shown (0-1)
        },
        "CONTENT": {
            "INNER": "<ul><li>Adjustable animations speed</li><li>Custom content</li><li>Custom shutter images</li></ul>", // InnerHTML for .shutter_Content
            "STYLE": {
                "font": "25pt Garamond",
                "margin": "20px",
                "padding": "10px",
                "padding-top": "60px"
            } // Style for shutter_Content
        }
    };
    SHUTTER.RIGHT = {
        "IMAGE": {
            "SRC": "img/Shutter_right.png", // Path to image
            "WIDTH": 300, // Preferred size (px)
            "HEIGHT": 300, // Preferred size (px)
            "SHOWN_PART": 0.9 // Part of image to be shown (0-1)
        },
        "CONTENT": {
            "INNER": "<span>Field for custom content with your own CSS stylesheets</span><br><br><span style=\"font-size: 10pt\">Margin, border and padding are supported</span>", // InnerHTML for shutter_Content
            "STYLE": {
                "color": "#ffffff",
                "background": "linear-gradient(to top, #000000, #0066cc)",
                "border": "1px solid #000000",
                "font": "25pt Garamond",
                "margin": "20px",
                "padding": "30px",
                "padding-top": "60px"
            } // Style for .shutter_Content
        }
    };

    $("#shutter_Container").css({"height": SHUTTER.HEIGHT, "opacity": "0"}); // Container is empty
    $("#shutter_Container").html(
        "<div id=\"shutter_Left\"  class=\"shutter\"><img class=\"shutter_Image\" height=\"" + SHUTTER.LEFT.IMAGE.HEIGHT + "\"  width=\"" + SHUTTER.LEFT.IMAGE.WIDTH + "\"  src=\"" + SHUTTER.LEFT.IMAGE.SRC + "\" ></div>" +
        "<div id=\"shutter_Left_Content\"  class=\"shutter_Content\"></div>" +
        "<div id=\"shutter_Right\" class=\"shutter\"><img class=\"shutter_Image\" height=\"" + SHUTTER.RIGHT.IMAGE.HEIGHT + "\" width=\"" + SHUTTER.RIGHT.IMAGE.WIDTH + "\" src=\"" + SHUTTER.RIGHT.IMAGE.SRC + "\"></div>" +
        "<div id=\"shutter_Right_Content\" class=\"shutter_Content\">" + SHUTTER.RIGHT.CONTENT.STYLE + "\"></div>"
    );
    $(".shutter_Image").on("dragstart",function () {return false;});

    // Left shutter
    SHUTTER.LEFT.POSITION = {};
    SHUTTER.LEFT.POSITION.CLOSED = {
        "DIV_LEFT": $("#shutter_Container").width() / 2 - SHUTTER.LEFT.IMAGE.WIDTH,
        "IMG_TOP": (SHUTTER.HEIGHT - SHUTTER.LEFT.IMAGE.HEIGHT) / 2,
        "IMG_LEFT": SHUTTER.LEFT.IMAGE.WIDTH * (1 - SHUTTER.LEFT.IMAGE.SHOWN_PART)
    };
    SHUTTER.LEFT.POSITION.OPEN = {
        "DIV_LEFT": SHUTTER.PADDING.LEFT,
        "IMG_TOP": (SHUTTER.HEIGHT - SHUTTER.LEFT.IMAGE.HEIGHT) / 2,
        "IMG_LEFT": 0
    };

    $("#shutter_Left").css({
        "height": SHUTTER.HEIGHT,
        "width": SHUTTER.LEFT.IMAGE.WIDTH,
        "left": SHUTTER.LEFT.POSITION.CLOSED.DIV_LEFT,
        "border-right": "1px solid" + SHUTTER.BORDER_COLOR
    });
    $("#shutter_Left > img").css({"top": SHUTTER.LEFT.POSITION.CLOSED.IMG_TOP, "left": SHUTTER.LEFT.POSITION.CLOSED.IMG_LEFT});
    $("#shutter_Left_Content").css(SHUTTER.LEFT.CONTENT.STYLE);
    $("#shutter_Left_Content").css({"left": SHUTTER.LEFT.POSITION.OPEN.DIV_LEFT + SHUTTER.LEFT.IMAGE.WIDTH});
    let marginSize = $("#shutter_Left_Content").outerHeight(true) - $("#shutter_Left_Content").outerHeight(false);
    $("#shutter_Left_Content").outerHeight(SHUTTER.HEIGHT - marginSize);
    marginSize = $("#shutter_Left_Content").outerWidth(true) - $("#shutter_Left_Content").outerWidth(false);
    $("#shutter_Left_Content").outerWidth(SHUTTER.LEFT.POSITION.CLOSED.DIV_LEFT - SHUTTER.LEFT.POSITION.OPEN.DIV_LEFT - marginSize);
    $("#shutter_Left_Content").html(SHUTTER.LEFT.CONTENT.INNER);

    // Right shutter
    SHUTTER.RIGHT.POSITION = {};
    SHUTTER.RIGHT.POSITION.CLOSED = {
        "DIV_LEFT": $("#shutter_Container").width() / 2,
        "IMG_TOP": (SHUTTER.HEIGHT - SHUTTER.RIGHT.IMAGE.HEIGHT) / 2,
        "IMG_LEFT": SHUTTER.RIGHT.IMAGE.WIDTH * (SHUTTER.RIGHT.IMAGE.SHOWN_PART - 1)
    };
    SHUTTER.RIGHT.POSITION.OPEN = {
        "DIV_LEFT": $("#shutter_Container").width() - SHUTTER.PADDING.RIGHT - SHUTTER.RIGHT.IMAGE.WIDTH,
        "IMG_TOP": (SHUTTER.HEIGHT - SHUTTER.RIGHT.IMAGE.HEIGHT) / 2,
        "IMG_LEFT": 0
    };

    $("#shutter_Right").css({
        "height": SHUTTER.HEIGHT,
        "width": SHUTTER.RIGHT.IMAGE.WIDTH,
        "left": SHUTTER.RIGHT.POSITION.CLOSED.DIV_LEFT,
        "border-left": "1px solid" + SHUTTER.BORDER_COLOR
    });
    $("#shutter_Right > img").css({"top": SHUTTER.RIGHT.POSITION.CLOSED.IMG_TOP, "left": SHUTTER.RIGHT.POSITION.CLOSED.IMG_LEFT});
    $("#shutter_Right_Content").css(SHUTTER.RIGHT.CONTENT.STYLE);
    $("#shutter_Right_Content").css({"left": SHUTTER.RIGHT.POSITION.CLOSED.DIV_LEFT});
    marginSize = $("#shutter_Right_Content").outerHeight(true) - $("#shutter_Right_Content").outerHeight(false);
    $("#shutter_Right_Content").outerHeight(SHUTTER.HEIGHT - marginSize);
    marginSize = $("#shutter_Right_Content").outerWidth(true) - $("#shutter_Right_Content").outerWidth(false);
    $("#shutter_Right_Content").outerWidth(SHUTTER.RIGHT.POSITION.OPEN.DIV_LEFT - SHUTTER.RIGHT.POSITION.CLOSED.DIV_LEFT - marginSize);
    $("#shutter_Right_Content").html(SHUTTER.RIGHT.CONTENT.INNER);

    // Ready
    $("#shutter_Container").animate({"opacity": "1"}, SHUTTER.SHOW_TIME); // Revealing container
    SHUTTER.STATUS = "CLOSED";
    $(".shutter").click(toggleShutter);


    function toggleShutter (event) {
        $(".shutter").off("click");
        if (SHUTTER.STATUS == "CLOSED") {
            let div = $(event.target).closest(".shutter")[0];
            let img = div.children[0];
            let cnt = $("#" + $(div).attr("id") + "_Content")[0];
            if ($(div).attr("id") == "shutter_Left") {
                SHUTTER.STATUS = "LEFT";
                $(div).css({"border-right": "0px solid" + SHUTTER.BORDER_COLOR, "z-index": 0});
            } else {
                SHUTTER.STATUS = "RIGHT";
                $(div).css({"border-left": "0px solid" + SHUTTER.BORDER_COLOR, "z-index": 0});
            }
            let s = SHUTTER.STATUS;
            let dImg = Math.abs(SHUTTER[s].POSITION.CLOSED.IMG_LEFT - SHUTTER[s].POSITION.OPEN.IMG_LEFT);
            let dDiv = Math.abs(SHUTTER[s].POSITION.CLOSED.DIV_LEFT - SHUTTER[s].POSITION.OPEN.DIV_LEFT);
            let tImg = dImg * SHUTTER.OPEN_TIME / (dDiv + dImg);
            let tDiv = (SHUTTER.OPEN_TIME - tImg);
            $(img).animate({"left": SHUTTER[s].POSITION.OPEN.IMG_LEFT}, {"easing": "easeInSine", "duration": tImg, "complete": function () {
                $(div).animate({"left": SHUTTER[s].POSITION.OPEN.DIV_LEFT}, {"easing": "easeOutSine", "duration": tDiv, "complete": function () {
                    $(cnt).animate({"opacity": "1"}, {"duration": SHUTTER.CONTENT_SHOW_TIME, "complete": function () {
                        $(".shutter").click(toggleShutter);
                    }});
                }});
            }});

        } else {
            let div;
            if (SHUTTER.STATUS == "LEFT") {
                div = $("#shutter_Left")[0];
                setTimeout(function(){$(div).css({"border-right": "1px solid" + SHUTTER.BORDER_COLOR});},SHUTTER.CLOSE_TIME + SHUTTER.CONTENT_SHOW_TIME - 1);
            } else {
                div = $("#shutter_Right")[0];
                setTimeout(function(){$(div).css({"border-left": "1px solid" + SHUTTER.BORDER_COLOR});},SHUTTER.CLOSE_TIME + SHUTTER.CONTENT_SHOW_TIME - 1);
            }
            let img = div.children[0];
            let cnt = $("#" + $(div).attr("id") + "_Content")[0];
            let s = SHUTTER.STATUS;
            let dImg = Math.abs(SHUTTER[s].POSITION.CLOSED.IMG_LEFT - SHUTTER[s].POSITION.OPEN.IMG_LEFT);
            let dDiv = Math.abs(SHUTTER[s].POSITION.CLOSED.DIV_LEFT - SHUTTER[s].POSITION.OPEN.DIV_LEFT);
            let tImg = dImg * SHUTTER.CLOSE_TIME / (dDiv + dImg);
            let tDiv = SHUTTER.CLOSE_TIME - tImg;
            $(cnt).animate({"opacity": "0"}, {"duration": SHUTTER.CONTENT_SHOW_TIME, "complete": function () {
                $(div).animate({"left": SHUTTER[s].POSITION.CLOSED.DIV_LEFT}, {"easing": "easeInSine", "duration": tDiv, "complete": function () {
                    $(img).animate({"left": SHUTTER[s].POSITION.CLOSED.IMG_LEFT}, {"easing": "easeOutSine", "duration": tImg, "complete": function () {
                        $(div).css({"z-index": ""});
                        $(".shutter").click(toggleShutter);
                    }});
                }});
            }});
            SHUTTER.STATUS = "CLOSED";
        }
    }
});
