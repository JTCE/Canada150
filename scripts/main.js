var DEV, EMBEDLY_URL, Locale, URL, donePosting, errorPosting, escapeHtmlEntities, getLocation, initMap, loadMoments, local, moments, momentsURL, populateText, readEmbedly, shareOnFacebook, shareOnTwitter, showCategory, showDecade, toggleMenu, validateEmail, visibleCards;

URL = "/can150restdata";

EMBEDLY_URL = "https://api.embed.ly/1/oembed?key=53533f4413fb4beebd3d7fa98156c126&url=";

moments = [];

DEV = true;

Locale = {
  en: {
    email_invalid: "Invalid email address",
    fill_all: "Please fill all the necessary fields",
    open_media: "Open Media",
    language_id: 0
  },
  fr: {
    email_invalid: "L'adresse courriel était périmée",
    fill_all: "Remplissez alors tous les champs requis",
    open_media: "Ouvrir le lien",
    language_id: 1
  }
};

$(document).ready(function() {
  // $(document).tooltip({
  //   position: {
  //     my: "center bottom+25",
  //     at: "left-45 top"
  //   },
  //   show: null,
  //   open: function(event, ui) {
  //     return ui.tooltip.animate({
  //       left: ui.tooltip.position().left - 10
  //     }, 100);
  //   }
  // });
  loadMoments();
  $('.facebook').click(function() {
    return shareOnFacebook();
  });
  $('.twitter').click(function() {
    return shareOnTwitter();
  });
  $('.media-link').keyup(function() {
    if ($('.media-link').val() !== "") {
      $('.title-field').hide();
      return $('.description-field').hide();
    } else {
      $('.title-field').show();
      return $('.description-field').show();
    }
  });
  $(".categories .links a").click(function() {
    var id;
    $(".categories .links a").removeClass('on');
    $(this).addClass('on');
    id = $(this).data('id');
    return showCategory(id);
  });
  $("#submit-button").click(function() {
    var moment, momentStr;
    if ($('.email').val() !== "" && $('.location').val() !== "" && ($('.media-link').val() !== "" || $('.description').val() !== "")) {
      if (validateEmail($('.email').val())) {
        moment = {
          name: $('.name').val(),
          email: $('.email').val(),
          location: $('.location').val(),
          time: $('.datetime').val(),
          link: $('.media-link').val(),
          title: escapeHtmlEntities($('.moment-title').val()),
          message: $('.description').val(),
          categoryId: $('.category-id').val(),
          language: $('.language-id').val()
        };
        momentStr = JSON.stringify(moment);
        return $.ajax({
          type: "POST",
          url: "/moments-0.json",
          data: momentStr,
          success: donePosting,
          error: errorPosting,
          contentType: "application/json"
        });
      } else {
        $(".errors").html(local().email_invalid);
        $(".errors").fadeIn('fast');
        return $('.email').focus();
      }
    } else {
      $(".errors").html(local().fill_all);
      return $(".errors").fadeIn('fast');
    }
  });
  $("#cancel-button").click(function() {
    return toggleMenu();
  });
  $(".social-icons-select i").click(function() {
    $(".social-icons-select i").removeClass('on');
    $(this).toggleClass('on');
    $(".media-link").attr('placeholder', "Link to " + ($(this).data('name')) + " Media");
    return $(".media-link").fadeIn('fast');
  });
  $(".prev").click(function() {
    return console.log("previousing");
  });
  return $(".next").click(function() {
    return console.log("nexting");
  });
});

local = function() {
  if ($("html").attr("lang") === "en") {
    return Locale.en;
  } else {
    return Locale.fr;
  }
};

showDecade = function(decade) {
  var time_cards;
  console.log("gonna show decade " + decade);
  if ($("#decade-" + decade).hasClass("current")) {
    $(".year-content").show();
    return $("#decade-" + decade).removeClass("current");
  } else {
    $(".decade").removeClass("current");
    $("#decade-" + decade).addClass("current");
    time_cards = $(".year-content");
    time_cards.hide();
    decade = "" + (decade.toString().substring(0, 3));
    return $.each(time_cards, function(key, val) {
      var year, year_id;
      year_id = "#" + val.id;
      year = $(year_id).data('year');
      if (year.toString().lastIndexOf(decade, 0) === 0) {
        $(year_id).show();
        return console.log(year + " starting tho");
      }
    });
  }
};

showCategory = function(id) {
  var time_cards;
  if (id < 1) {
    $('.card').show();
  } else {
    $(".usual-card").hide();
    $("*[data-category-id='" + id + "']").show();
  }
  time_cards = $(".year-content");
  $(".timeline").show();
  return $.each(time_cards, function(key, val) {
    if (visibleCards(val.id) === 1) {
      return $("#" + val.id + " .timeline").hide();
    }
  });
};

getLocation = function(href) {
  var l;
  l = document.createElement("a");
  l.href = href;
  return l;
};

visibleCards = function(id) {
  var children, visible;
  children = $("#" + id).children();
  visible = 0;
  $.each(children, function(key, val) {
    if ($("#" + val.id).css('display') !== "none") {
      return visible++;
    }
  });
  return visible;
};

momentsURL = function() {
  if (DEV) {
    return "./moments-" + (local().language_id) + ".json";
  } else {
    return URL + "/moment/search/findByLanguageOrderByTimeAsc?language=" + (local().language_id);
  }
};

loadMoments = function() {
  console.log("loading moments.");
  return $.getJSON(momentsURL(), function(data) {
    $(".cards").html("");
    $(".years .body").html("");
    if (data._embedded != null) {
      moments = data._embedded.moment;
      $.each(moments, function(key, val) {
        var card_html, card_key, category_id, decade, hostname, link, location, message, name, site_name, text, timeline_html, title, year, year_html;
        year = val.time;
        link = val.link;
        category_id = val.categoryId;
        message = val.message;
        title = val.title;
        name = val.name;
        location = val.location;
        hostname = getLocation(val.link).hostname;
        site_name = hostname.substring(0, hostname.indexOf('.'));
        timeline_html = "<span class=\"year-content\" id=\"year-" + year + "-content\" data-year=\"" + year + "\"><div class=\"card timeline\" id=\"year-" + year + "\">\n  <div class=\"card-container\">" + year + "\n    <div class=\"back-arrow\"><i class=\"icon-right\"></i></div>\n  </div>\n</div></span>";
        if (year >= 1860) {
          decade = (year.toString().substring(0, 3)) + "0s";
          year_html = "<a id=\"decade-" + decade + "\" class=\"decade\">" + decade + "</a>";
          if ($("#decade-" + decade).length === 0) {
            $(".years .body").append(year_html);
          }
        }
        if ($("#year-" + year).length === 0) {
          $(".cards").append(timeline_html);
        }
        card_key = key + 2;
        card_html = "<div class=\"card usual-card\" id=\"card-" + card_key + "\" data-category-id=\"" + category_id + "\">\n  <div class=\"card-container\">\n    <div class=\"location\">" + location + "</div>\n    <a href=\"" + link + "\" target=\"_blank\" class=\"external-link\" alt=\"" + (local().open_media) + "\" title=\"" + (local().open_media) + "\"><i class=\"icon-link-ext\"></i></a>\n    <i class=\"social-media-icon\"></i>\n   <div class=\"user\">" + name + "</div>\n    <div class=\"title\"></div>\n </div>\n</div>";
        $("#year-" + year + "-content").append(card_html);
        if (link) {
          return readEmbedly(link, card_key, title);
        } else {
          text = "<div style=\"text-align:center;font-weight:bold;font-size: 14px;margin-bottom: 5px;\">" + title + "</div>&#8220;<span style='font-weight:300'>" + message + "</span>&#8221; <div style='text-align:right;margin-top: 5px'> &mdash; <i>" + name + "</i></div>";
          populateText(text, "#card-" + card_key);
          $("#card-" + card_key + " .title").attr("style", "top:0px;");
          return $("#card-" + card_key + " .external-link").remove();
        }
      });
    }
    return $('.decade').click(function() {
      var decade;
      decade = $(this).html();
      return showDecade(decade);
    });
  });
};

readEmbedly = function(url, card_key, text) {
  if (text == null) {
    text = null;
  }
  return $.getJSON("" + EMBEDLY_URL + url + "&callback=?", function(embedly_data) {
    var icon_name, image_url;
    icon_name = "icon-" + (embedly_data.provider_name.toLowerCase());
    image_url = embedly_data.url;
    if (!text || text === "") {
      text = embedly_data.description;
    }
    switch (embedly_data.provider_name) {
      case "Instagram":
        image_url = embedly_data.thumbnail_url;
        icon_name = "icon-instagramm";
        text = embedly_data.title;
        if (!image_url) {
          populateText(embedly_data.description, "#card-" + card_key);
        }
        break;
      case "Vine":
        image_url = embedly_data.thumbnail_url;
        text = embedly_data.title;
        break;
      case "Google":
        icon_name = "icon-gplus";
        break;
      case "Twitter":
        if (embedly_data.type === "link") {
          populateText(embedly_data.description, "#card-" + card_key);
        }
        break;
      case "Facebook":
        if (embedly_data.type === "rich") {
          image_url = embedly_data.thumbnail_url;
          if (!image_url) {
            populateText(embedly_data.description, "#card-" + card_key);
          }
        }
        break;
      case "YouTube":
        if (embedly_data.type === "video") {
          image_url = embedly_data.thumbnail_url;
          if (!image_url) {
            populateText(embedly_data.description, "#card-" + card_key);
          }
        }
        break;
      case "Flickr":
        icon_name = "icon-flickr-circled";
    }
    $("#card-" + card_key).css("background-image", "url(" + image_url + ")");
    $("#card-" + card_key + " .social-media-icon").addClass(icon_name);
    return $("#card-" + card_key + " .title").html(text);
  });
};

populateText = function(text, id) {
  $(id).addClass("no-image");
  $(id + "  .title").html(text);
  console.log("length is " + text.length);
  if (text.length <= 40) {
    return $(id + "  .title").attr("style", "font-size: 22px;text-align: center;top: 45px;");
  } else if (text.length <= 77) {
    return $(id + "  .title").attr("style", "font-size: 22px;");
  }
};

donePosting = function(data) {
  var share_html;
  if (data == null) {
    data = null;
  }
  share_html = "<div class=\"share-this\">\n  <div class=\"social-icons\">\n    <a class=\"facebook\" href=\"javascript:shareOnFacebook();\"><i class=\"icon-facebook\"></i> Facebook</a>\n   <a class=\"twitter\" href=\"javascript:shareOnTwitter();\"><i class=\"icon-twitter\"></i> Twitter</a>\n </div>\n</div>";
  $(".directions").html("<p class=\"moment-share-text\"> Now encourage your friends to share their proud Canadian moment too!</p> " + share_html);
  $(".moment-form").html("<p class=\"moment-posted-text\">Thank you for sharing your proud Canadian moment. Your moment has been submitted successfully.<br /><br />Please allow us about <b>3-4</b> days to review and approve your moment to have it featured on the main page.</p>");
  $(".share-ur-moment").css("height", "220px");
  return loadMoments();
};

errorPosting = function(error) {
  return console.log("error posting: " + error.responseText);
};

shareOnFacebook = function() {
  var share_link, summary, thumb_url, title, url;
  title = "Canada150: My proudest moments";
  summary = 'I just shared my proud Canadian moment, Share yours too. #canada150';
  url = 'http://pch.gc.ca';
  thumb_url = '';
  share_link = "http://www.facebook.com/sharer.php?s=100&p[title]=" + (encodeURIComponent(title)) + "&p[summary]=" + (encodeURIComponent(summary)) + "&p[url]=" + (encodeURIComponent(url)) + "&p[images][0]=" + thumb_url;
  return window.open(share_link, "mywindow", "location=1,status=1,scrollbars=1,  width=640,height=320");
};

shareOnTwitter = function() {
  var share_link, summary, url;
  summary = 'I just shared my proud Canadian moment, Share yours too. #canada150';
  url = 'http://pch.gc.ca';
  share_link = "https://twitter.com/share?text=" + (encodeURIComponent(summary.trim())) + "&url=" + url;
  return window.open(share_link, "mywindow", "location=1,status=1,scrollbars=1,  width=640,height=320");
};

toggleMenu = function() {
  if ($(".share-ur-moment").hasClass('open')) {
    return $(".new-moment").fadeOut('fast', function() {
      return $(".share-ur-moment").removeClass("open");
    });
  } else {
    $(".share-ur-moment").addClass("open");
    return $(".new-moment").delay(155).fadeIn('fast');
  }
};

initMap = function() {
  return console.log("hi");
};

validateEmail = function(email) {
  var re;
  re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

escapeHtmlEntities = function(text) {
  return text.replace(/[\u00A0-\u2666<>\&]/g, function(c) {
    return "&" + (escapeHtmlEntities.entityTable[c.charCodeAt(0)] || "#" + c.charCodeAt(0)) + ";";
  });
};

escapeHtmlEntities.entityTable = {
  34: "quot",
  38: "amp",
  39: "apos",
  60: "lt",
  62: "gt",
  160: "nbsp",
  161: "iexcl",
  162: "cent",
  163: "pound",
  164: "curren",
  165: "yen",
  166: "brvbar",
  167: "sect",
  168: "uml",
  169: "copy",
  170: "ordf",
  171: "laquo",
  172: "not",
  173: "shy",
  174: "reg",
  175: "macr",
  176: "deg",
  177: "plusmn",
  178: "sup2",
  179: "sup3",
  180: "acute",
  181: "micro",
  182: "para",
  183: "middot",
  184: "cedil",
  185: "sup1",
  186: "ordm",
  187: "raquo",
  188: "frac14",
  189: "frac12",
  190: "frac34",
  191: "iquest",
  192: "Agrave",
  193: "Aacute",
  194: "Acirc",
  195: "Atilde",
  196: "Auml",
  197: "Aring",
  198: "AElig",
  199: "Ccedil",
  200: "Egrave",
  201: "Eacute",
  202: "Ecirc",
  203: "Euml",
  204: "Igrave",
  205: "Iacute",
  206: "Icirc",
  207: "Iuml",
  208: "ETH",
  209: "Ntilde",
  210: "Ograve",
  211: "Oacute",
  212: "Ocirc",
  213: "Otilde",
  214: "Ouml",
  215: "times",
  216: "Oslash",
  217: "Ugrave",
  218: "Uacute",
  219: "Ucirc",
  220: "Uuml",
  221: "Yacute",
  222: "THORN",
  223: "szlig",
  224: "agrave",
  225: "aacute",
  226: "acirc",
  227: "atilde",
  228: "auml",
  229: "aring",
  230: "aelig",
  231: "ccedil",
  232: "egrave",
  233: "eacute",
  234: "ecirc",
  235: "euml",
  236: "igrave",
  237: "iacute",
  238: "icirc",
  239: "iuml",
  240: "eth",
  241: "ntilde",
  242: "ograve",
  243: "oacute",
  244: "ocirc",
  245: "otilde",
  246: "ouml",
  247: "divide",
  248: "oslash",
  249: "ugrave",
  250: "uacute",
  251: "ucirc",
  252: "uuml",
  253: "yacute",
  254: "thorn",
  255: "yuml",
  402: "fnof",
  913: "Alpha",
  914: "Beta",
  915: "Gamma",
  916: "Delta",
  917: "Epsilon",
  918: "Zeta",
  919: "Eta",
  920: "Theta",
  921: "Iota",
  922: "Kappa",
  923: "Lambda",
  924: "Mu",
  925: "Nu",
  926: "Xi",
  927: "Omicron",
  928: "Pi",
  929: "Rho",
  931: "Sigma",
  932: "Tau",
  933: "Upsilon",
  934: "Phi",
  935: "Chi",
  936: "Psi",
  937: "Omega",
  945: "alpha",
  946: "beta",
  947: "gamma",
  948: "delta",
  949: "epsilon",
  950: "zeta",
  951: "eta",
  952: "theta",
  953: "iota",
  954: "kappa",
  955: "lambda",
  956: "mu",
  957: "nu",
  958: "xi",
  959: "omicron",
  960: "pi",
  961: "rho",
  962: "sigmaf",
  963: "sigma",
  964: "tau",
  965: "upsilon",
  966: "phi",
  967: "chi",
  968: "psi",
  969: "omega",
  977: "thetasym",
  978: "upsih",
  982: "piv",
  8226: "bull",
  8230: "hellip",
  8242: "prime",
  8243: "Prime",
  8254: "oline",
  8260: "frasl",
  8472: "weierp",
  8465: "image",
  8476: "real",
  8482: "trade",
  8501: "alefsym",
  8592: "larr",
  8593: "uarr",
  8594: "rarr",
  8595: "darr",
  8596: "harr",
  8629: "crarr",
  8656: "lArr",
  8657: "uArr",
  8658: "rArr",
  8659: "dArr",
  8660: "hArr",
  8704: "forall",
  8706: "part",
  8707: "exist",
  8709: "empty",
  8711: "nabla",
  8712: "isin",
  8713: "notin",
  8715: "ni",
  8719: "prod",
  8721: "sum",
  8722: "minus",
  8727: "lowast",
  8730: "radic",
  8733: "prop",
  8734: "infin",
  8736: "ang",
  8743: "and",
  8744: "or",
  8745: "cap",
  8746: "cup",
  8747: "int",
  8756: "there4",
  8764: "sim",
  8773: "cong",
  8776: "asymp",
  8800: "ne",
  8801: "equiv",
  8804: "le",
  8805: "ge",
  8834: "sub",
  8835: "sup",
  8836: "nsub",
  8838: "sube",
  8839: "supe",
  8853: "oplus",
  8855: "otimes",
  8869: "perp",
  8901: "sdot",
  8968: "lceil",
  8969: "rceil",
  8970: "lfloor",
  8971: "rfloor",
  9001: "lang",
  9002: "rang",
  9674: "loz",
  9824: "spades",
  9827: "clubs",
  9829: "hearts",
  9830: "diams",
  338: "OElig",
  339: "oelig",
  352: "Scaron",
  353: "scaron",
  376: "Yuml",
  710: "circ",
  732: "tilde",
  8194: "ensp",
  8195: "emsp",
  8201: "thinsp",
  8204: "zwnj",
  8205: "zwj",
  8206: "lrm",
  8207: "rlm",
  8211: "ndash",
  8212: "mdash",
  8216: "lsquo",
  8217: "rsquo",
  8218: "sbquo",
  8220: "ldquo",
  8221: "rdquo",
  8222: "bdquo",
  8224: "dagger",
  8225: "Dagger",
  8240: "permil",
  8249: "lsaquo",
  8250: "rsaquo",
  8364: "euro"
};

// ---
// generated by coffee-script 1.9.2