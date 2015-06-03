
URL = "/can150restdata" #root url to the rest resource, no forward slash at the end though

EMBEDLY_URL = "https://api.embed.ly/1/oembed?key=53533f4413fb4beebd3d7fa98156c126&url="

moments = []

DEV = true

Locale = 
	en:
		email_invalid: "Invalid email address"
		fill_all: "Please fill all the necessary fields"
		open_media: "Open Media"
		language_id: 0

	fr:
		email_invalid: "L'adresse courriel était périmée"
		fill_all: "Remplissez alors tous les champs requis"
		open_media: "Ouvrir le lien"
		language_id: 1

$(document).ready ->
	# $(".datetime").datepicker
	# 	dateFormat: "yy-mm-dd"

	# $(document).tooltip
	# 	position:
	# 		my: "center bottom+25"
	# 		at: "left-45 top"
	# 	show: null
	# 	open: ( event, ui ) ->
	# 		ui.tooltip.animate left: ui.tooltip.position().left - 10 , 100

	loadMoments()
	# initMap()

	# $(".share-link").click ->
	# 	toggleMenu()

	$('.facebook').click ->
		shareOnFacebook()

	$('.twitter').click ->
		shareOnTwitter()



	$('.media-link').keyup ->
		if $('.media-link').val() != ""
			$('.title-field').hide()
			$('.description-field').hide()
		else
			$('.title-field').show()
			$('.description-field').show()


	$(".categories .links a").click ->
		$(".categories .links a").removeClass 'on'
		$(this).addClass 'on'
		id = $(this).data('id')
		showCategory(id)

	$("#submit-button").click ->
		# console.log "form submittted though"
		if $('.email').val() != "" && $('.location').val() != "" && ($('.media-link').val() != "" || $('.description').val() != "")
			if validateEmail($('.email').val())
				moment =
					name: $('.name').val()
					email: $('.email').val()
					location: $('.location').val()
					# socialId: $('.social-icons-select i.on').data('id')
					time: $('.datetime').val()
					link: $('.media-link').val()
					title: escapeHtmlEntities $('.moment-title').val()
					message: $('.description').val()
					categoryId: $('.category-id').val()
					language: $('.language-id').val()
					# typeId: 0

				momentStr = JSON.stringify(moment)
				# console.log "posting #{momentStr}"

				$.ajax
					type: "POST"
					url: "/moments-0.json" #"#{URL}/moment"
					data: momentStr
					success: donePosting
					error: errorPosting
					contentType: "application/json"
			else
				$(".errors").html local().email_invalid
				$(".errors").fadeIn 'fast'
				$('.email').focus()

		else
			$(".errors").html local().fill_all
			$(".errors").fadeIn 'fast'

	$("#cancel-button").click ->
		toggleMenu()

	$(".social-icons-select i").click ->
		$(".social-icons-select i").removeClass 'on'
		$(this).toggleClass 'on'
		$(".media-link").attr 'placeholder', "Link to #{$(this).data('name')} Media"
		$(".media-link").fadeIn 'fast'



	$(".prev").click ->
		console.log "previousing"

	$(".next").click ->
		console.log "nexting"


local = ->
	if $("html").attr("lang") is "en"
		Locale.en
	else
		Locale.fr
	

showDecade = (decade) ->
	console.log "gonna show decade #{decade}"
	if $("#decade-#{decade}").hasClass "current"
		$(".year-content").show()
		$("#decade-#{decade}").removeClass "current"

	else

		$(".decade").removeClass "current"
		$("#decade-#{decade}").addClass "current"

		time_cards = $(".year-content")
		time_cards.hide()
		decade = "#{decade.toString().substring(0, 3)}"


		$.each time_cards, (key, val) ->
			year_id = "##{val.id}"
			year = $(year_id).data('year')
			if year.toString().lastIndexOf(decade, 0) is 0
				$(year_id).show()
				console.log "#{year} starting tho"
	

showCategory = (id) ->
	# console.log "gonna show category #{id} #{moments}"
	if id < 1
		$('.card').show()
	else
		$(".usual-card").hide()
		$("*[data-category-id='#{id}']").show()


	time_cards = $(".year-content")
	$(".timeline").show()
	$.each time_cards, (key, val) ->
		# console.log "id: #{val.id} -> #{visibleCards(val.id)}"
		if visibleCards(val.id) == 1
			$("##{val.id} .timeline").hide()

getLocation = (href) ->
    l = document.createElement("a")
    l.href = href
    l

visibleCards = (id) ->
	children = $("##{id}").children()
	visible = 0
	$.each children, (key, val) ->
		if $("##{val.id}").css('display') != "none"
			visible++

	visible

momentsURL = -> 
	if DEV
		"./moments-#{local().language_id}.json"
	else
		"#{URL}/moment/search/findByLanguageOrderByTimeAsc?language=#{local().language_id}"


loadMoments = ->
	console.log "loading moments."

	$.getJSON momentsURL(), (data) ->
		$(".cards").html("")
		$(".years .body").html("")
		if data._embedded?
			moments = data._embedded.moment
			$.each moments, (key, val) ->
				year = val.time
				link = val.link
				category_id = val.categoryId
				message = val.message
				title = val.title
				name = val.name
				location = val.location

				hostname = getLocation(val.link).hostname
				site_name = hostname.substring 0,hostname.indexOf '.'

					
				
				timeline_html = """
				<span class="year-content" id="year-#{year}-content" data-year="#{year}"><div class="card timeline" id="year-#{year}">
					<div class="card-container">#{year}
						<div class="back-arrow"><i class="icon-right"></i></div>
					</div>
				</div></span>
				"""

				if year >= 1860
					decade = "#{year.toString().substring(0, 3)}0s"

					year_html = """<a id="decade-#{decade}" class="decade">#{decade}</a>"""


					if $("#decade-#{decade}").length == 0
						$(".years .body").append(year_html)


				if $("#year-#{year}").length == 0
					$(".cards").append(timeline_html)

				card_key = key + 2
				card_html = """
				<div class="card usual-card" id="card-#{card_key}" data-category-id="#{category_id}">
					<div class="card-container">
						<div class="location">#{location}</div>
						<a href="#{link}" target="_blank" class="external-link" alt="#{local().open_media}" title="#{local().open_media}"><i class="icon-link-ext"></i></a>
						<i class="social-media-icon"></i>
						<div class="user">#{name}</div>
						<div class="title"></div>
					</div>
				</div>
				"""

				$("#year-#{year}-content").append(card_html)


				if link
					readEmbedly(link,card_key,title)
				else
					text = "<div style=\"text-align:center;font-weight:bold;font-size: 14px;margin-bottom: 5px;\">#{title}</div>&#8220;<span style='font-weight:300'>#{message}</span>&#8221; <div style='text-align:right;margin-top: 5px'> &mdash; <i>#{name}</i></div>"
					populateText text, "#card-#{card_key}"
					$("#card-#{card_key} .title").attr "style", "top:0px;"
					$("#card-#{card_key} .external-link").remove()

		$('.decade').click ->
			decade = $(this).html()
			showDecade decade
		

readEmbedly = (url, card_key, text = null) ->
	$.getJSON "#{EMBEDLY_URL}#{url}&callback=?", (embedly_data) ->
		# console.log "card_key: #{card_key}, embedly data: "
		# console.dir embedly_data
		icon_name = "icon-#{embedly_data.provider_name.toLowerCase()}"
		image_url = embedly_data.url
		text = embedly_data.description if !text or text == ""

		switch embedly_data.provider_name
			when "Instagram"
				image_url = embedly_data.thumbnail_url
				icon_name = "icon-instagramm"
				text = embedly_data.title
				if !image_url
					populateText(embedly_data.description, "#card-#{card_key}")
				
			when "Vine"
				image_url = embedly_data.thumbnail_url
				text = embedly_data.title
			when "Google"
				icon_name = "icon-gplus"
			when "Twitter"
				if embedly_data.type is "link"
					populateText(embedly_data.description, "#card-#{card_key}")

				
			when "Facebook"
				if embedly_data.type is "rich"
					image_url = embedly_data.thumbnail_url
					if !image_url
						populateText(embedly_data.description, "#card-#{card_key}")
				
			when "YouTube"
				if embedly_data.type is "video"
					image_url = embedly_data.thumbnail_url
					if !image_url
						populateText(embedly_data.description, "#card-#{card_key}")

			when "Flickr"
				icon_name = "icon-flickr-circled"


		$("#card-#{card_key}").css "background-image", "url(#{image_url})"
		$("#card-#{card_key} .social-media-icon").addClass icon_name
		$("#card-#{card_key} .title").html text

		# console.log "card #{card_key} just loaded"

populateText = (text, id) ->
	$(id).addClass "no-image"
	$("#{id}  .title").html text
	console.log "length is #{text.length}"
	if text.length <= 40
		$("#{id}  .title").attr "style", "font-size: 22px;text-align: center;top: 45px;"
	else if text.length <= 77
		$("#{id}  .title").attr "style", "font-size: 22px;"
	

donePosting = (data = null) ->

	share_html = """
			<div class="share-this">
				<div class="social-icons">
					<a class="facebook" href="javascript:shareOnFacebook();"><i class="icon-facebook"></i> Facebook</a>
					<a class="twitter" href="javascript:shareOnTwitter();"><i class="icon-twitter"></i> Twitter</a>
				</div>
			</div>
	"""

	$(".directions").html "<p class=\"moment-share-text\"> Now encourage your friends to share their proud Canadian moment too!</p> #{share_html}"
	$(".moment-form").html "<p class=\"moment-posted-text\">Thank you for sharing your proud Canadian moment. Your moment has been submitted successfully.<br /><br />Please allow us about <b>3-4</b> days to review and approve your moment to have it featured on the main page.</p>"
	$(".share-ur-moment").css "height", "220px"
	loadMoments()


errorPosting = (error) ->
	console.log "error posting: #{error.responseText}"



shareOnFacebook = ->
	title = "Canada150: My proudest moments"
	summary = 'I just shared my proud Canadian moment, Share yours too. #canada150'
	url = 'http://pch.gc.ca'
	thumb_url = ''
	share_link = "http://www.facebook.com/sharer.php?s=100&p[title]=#{encodeURIComponent(title)}&p[summary]=#{encodeURIComponent(summary)}&p[url]=#{encodeURIComponent(url)}&p[images][0]=#{thumb_url}"
	window.open share_link, "mywindow", "location=1,status=1,scrollbars=1,  width=640,height=320"

shareOnTwitter = ->
	summary = 'I just shared my proud Canadian moment, Share yours too. #canada150'
	url = 'http://pch.gc.ca'
	share_link = "https://twitter.com/share?text=#{encodeURIComponent(summary.trim())}&url=#{url}"
	window.open share_link, "mywindow", "location=1,status=1,scrollbars=1,  width=640,height=320"


toggleMenu = ->

	if $(".share-ur-moment").hasClass 'open'
		$(".new-moment").fadeOut 'fast', ->
			$(".share-ur-moment").removeClass "open"
	else
		$(".share-ur-moment").addClass "open"
		$(".new-moment").delay(155).fadeIn 'fast'

initMap = ->
	console.log "hi"

validateEmail = (email) ->
    re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    re.test(email)

escapeHtmlEntities = (text) ->
	text.replace /[\u00A0-\u2666<>\&]/g, (c) ->
		"&" + (escapeHtmlEntities.entityTable[c.charCodeAt(0)] or "#" + c.charCodeAt(0)) + ";"

  
# all HTML4 entities as defined here: http://www.w3.org/TR/html4/sgml/entities.html
# added: amp, lt, gt, quot and apos
escapeHtmlEntities.entityTable =
	34: "quot"
	38: "amp"
	39: "apos"
	60: "lt"
	62: "gt"
	160: "nbsp"
	161: "iexcl"
	162: "cent"
	163: "pound"
	164: "curren"
	165: "yen"
	166: "brvbar"
	167: "sect"
	168: "uml"
	169: "copy"
	170: "ordf"
	171: "laquo"
	172: "not"
	173: "shy"
	174: "reg"
	175: "macr"
	176: "deg"
	177: "plusmn"
	178: "sup2"
	179: "sup3"
	180: "acute"
	181: "micro"
	182: "para"
	183: "middot"
	184: "cedil"
	185: "sup1"
	186: "ordm"
	187: "raquo"
	188: "frac14"
	189: "frac12"
	190: "frac34"
	191: "iquest"
	192: "Agrave"
	193: "Aacute"
	194: "Acirc"
	195: "Atilde"
	196: "Auml"
	197: "Aring"
	198: "AElig"
	199: "Ccedil"
	200: "Egrave"
	201: "Eacute"
	202: "Ecirc"
	203: "Euml"
	204: "Igrave"
	205: "Iacute"
	206: "Icirc"
	207: "Iuml"
	208: "ETH"
	209: "Ntilde"
	210: "Ograve"
	211: "Oacute"
	212: "Ocirc"
	213: "Otilde"
	214: "Ouml"
	215: "times"
	216: "Oslash"
	217: "Ugrave"
	218: "Uacute"
	219: "Ucirc"
	220: "Uuml"
	221: "Yacute"
	222: "THORN"
	223: "szlig"
	224: "agrave"
	225: "aacute"
	226: "acirc"
	227: "atilde"
	228: "auml"
	229: "aring"
	230: "aelig"
	231: "ccedil"
	232: "egrave"
	233: "eacute"
	234: "ecirc"
	235: "euml"
	236: "igrave"
	237: "iacute"
	238: "icirc"
	239: "iuml"
	240: "eth"
	241: "ntilde"
	242: "ograve"
	243: "oacute"
	244: "ocirc"
	245: "otilde"
	246: "ouml"
	247: "divide"
	248: "oslash"
	249: "ugrave"
	250: "uacute"
	251: "ucirc"
	252: "uuml"
	253: "yacute"
	254: "thorn"
	255: "yuml"
	402: "fnof"
	913: "Alpha"
	914: "Beta"
	915: "Gamma"
	916: "Delta"
	917: "Epsilon"
	918: "Zeta"
	919: "Eta"
	920: "Theta"
	921: "Iota"
	922: "Kappa"
	923: "Lambda"
	924: "Mu"
	925: "Nu"
	926: "Xi"
	927: "Omicron"
	928: "Pi"
	929: "Rho"
	931: "Sigma"
	932: "Tau"
	933: "Upsilon"
	934: "Phi"
	935: "Chi"
	936: "Psi"
	937: "Omega"
	945: "alpha"
	946: "beta"
	947: "gamma"
	948: "delta"
	949: "epsilon"
	950: "zeta"
	951: "eta"
	952: "theta"
	953: "iota"
	954: "kappa"
	955: "lambda"
	956: "mu"
	957: "nu"
	958: "xi"
	959: "omicron"
	960: "pi"
	961: "rho"
	962: "sigmaf"
	963: "sigma"
	964: "tau"
	965: "upsilon"
	966: "phi"
	967: "chi"
	968: "psi"
	969: "omega"
	977: "thetasym"
	978: "upsih"
	982: "piv"
	8226: "bull"
	8230: "hellip"
	8242: "prime"
	8243: "Prime"
	8254: "oline"
	8260: "frasl"
	8472: "weierp"
	8465: "image"
	8476: "real"
	8482: "trade"
	8501: "alefsym"
	8592: "larr"
	8593: "uarr"
	8594: "rarr"
	8595: "darr"
	8596: "harr"
	8629: "crarr"
	8656: "lArr"
	8657: "uArr"
	8658: "rArr"
	8659: "dArr"
	8660: "hArr"
	8704: "forall"
	8706: "part"
	8707: "exist"
	8709: "empty"
	8711: "nabla"
	8712: "isin"
	8713: "notin"
	8715: "ni"
	8719: "prod"
	8721: "sum"
	8722: "minus"
	8727: "lowast"
	8730: "radic"
	8733: "prop"
	8734: "infin"
	8736: "ang"
	8743: "and"
	8744: "or"
	8745: "cap"
	8746: "cup"
	8747: "int"
	8756: "there4"
	8764: "sim"
	8773: "cong"
	8776: "asymp"
	8800: "ne"
	8801: "equiv"
	8804: "le"
	8805: "ge"
	8834: "sub"
	8835: "sup"
	8836: "nsub"
	8838: "sube"
	8839: "supe"
	8853: "oplus"
	8855: "otimes"
	8869: "perp"
	8901: "sdot"
	8968: "lceil"
	8969: "rceil"
	8970: "lfloor"
	8971: "rfloor"
	9001: "lang"
	9002: "rang"
	9674: "loz"
	9824: "spades"
	9827: "clubs"
	9829: "hearts"
	9830: "diams"
	338: "OElig"
	339: "oelig"
	352: "Scaron"
	353: "scaron"
	376: "Yuml"
	710: "circ"
	732: "tilde"
	8194: "ensp"
	8195: "emsp"
	8201: "thinsp"
	8204: "zwnj"
	8205: "zwj"
	8206: "lrm"
	8207: "rlm"
	8211: "ndash"
	8212: "mdash"
	8216: "lsquo"
	8217: "rsquo"
	8218: "sbquo"
	8220: "ldquo"
	8221: "rdquo"
	8222: "bdquo"
	8224: "dagger"
	8225: "Dagger"
	8240: "permil"
	8249: "lsaquo"
	8250: "rsaquo"
	8364: "euro"
