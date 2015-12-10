
var Article = function(args) {
	this.id = args.id || 1;
	this.title = args.title || null;
	this.date = args.date || 'Now';
	this.content = args.content;
	this.tags = args.tags || [];
	this.image = args.image || 'http://placehold.it/500x500';
	
	this.elements = {
		articleSpan : $('<span>'),
		titleSpan : $('<h3>'),
		dateSpan : $('<p>'),
		contentSpan : $('<p>'),
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
		this.content = articleObj.content;
		this.tags = articleObj.tags;
		this.image = articleObj.image;
	},

	getData : function () {
		return this;
	},

	generateDomElements : function (data) {

		this.elements.titleSpan.append(data.title);
		this.elements.dateSpan.append(data.date);
		this.elements.contentSpan.append(data.content[0].text);
		this.elements.contentSpan.addClass('text');
		this.elements.imageSpan.attr('src', data.image);

		this.elements.articleSpan.append(this.elements.titleSpan);
		this.elements.articleSpan.append(this.elements.dateSpan);
		this.elements.articleSpan.append(this.elements.contentSpan);
		this.elements.articleSpan.append(this.elements.imageSpan);
		this.elements.articleSpan.attr('id', this.id);


		$('.article').prepend(this.elements.articleSpan);
	},

	registerHandler : function () {

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

