
var Article = function(args) {
	this.id = args.id || 1;
	this.title = args.title || null;
	this.date = args.date || 'Now';
	this.text = args.text;
	this.tags = args.tags || [];
	this.image = args.image || 'http://placehold.it/500x500';
	
	this.elements = {
		articleSpan : $('<span>'),
		titleSpan : $('<h3>'),
		dateSpan : $('<p>'),
		textSpan : $('<p>'),
		imageSpan : $('<img>')
	};

	this.generateDomElements(args);
	this.registerHandler();

};

Article.prototype = {
	constructor: Article,

	setData : function (articleObj) {
		this.title = articleObj.title;
		this.date = articleObj.date;
		this.text = articleObj.text;
		this.tags = articleObj.tags;
		this.image = articleObj.image;
	},

	getData : function () {
		return this;
	},

	generateDomElements : function (data) {

		this.elements.titleSpan.append(data.title);
		this.elements.dateSpan.append(data.date);
		this.elements.textSpan.append(data.text.en);
		this.elements.imageSpan.attr('src', data.image);

		this.elements.articleSpan.append(this.elements.titleSpan);
		this.elements.articleSpan.append(this.elements.dateSpan);
		this.elements.articleSpan.append(this.elements.textSpan);
		this.elements.articleSpan.append(this.elements.imageSpan);
		this.elements.articleSpan.attr('id', this.id);


		$('.article').prepend(this.elements.articleSpan);
	},

	registerHandler : function () {

		var self = this;
		this.elements.articleSpan.on('click', function () {

			if ($(this).attr('class') === 'active') {
				$(this).removeClass('active');
			} 
			else {
				$('.article').children().each(function () {
					if ($(this).attr('class') === 'active') {
						$(this).removeClass('active');
					}
				});
				$(this).attr('class', 'active');
			}
		});

	}

};

