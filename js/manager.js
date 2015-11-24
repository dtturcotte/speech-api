
document.addEventListener("DOMContentLoaded", function(event) {

	Utilities = Utilities || {};

	Utilities.Manager = {

		init : function () {
			this.content = [];
			this.requested_content = null;
			this.createContent();
		},

		getContent : function () {
			return this.content;
		},

		setContent : function (content) {
			this.content.push(content);
		},

		createContent : function () {

			var self = this;
			$.getJSON('./json/articles.json', function (json) {
				for (var i = 0; i < json.data.length; i++) {
					self.content.push(new Article(json.data[i]));
				}
			});

		},

		getContentById : function (id) {

			for (var i = 0; i < this.content.length; i++) {
				if (this.content[i].id === +id) {
					return this.content[i];
				}
			}
		},

		getContentByTags : function (tags) {

			for (var i = 0; i < this.content.length; i++) {
				for (var j = 0; j < this.content[i].tags.length; j++) {
					if (this.content[i].tags[j] === tags[0]) {
						return this.content[i];
					}
				}
			}

		},

		getLanguage : function (requested_language) {
			return Utilities.STT.getLanguageData()[requested_language];
		},

		/*
			Return lexical portions of the command
		*/
		getLexicalComponents : function (command) {

			return {
				verbs 		 : command.intersect(Utilities.Lexicon.getLexicon().verbs),
				prepositions : command.intersect(Utilities.Lexicon.getLexicon().prepositions),
				adverbs	 	 : command.intersect(Utilities.Lexicon.getLexicon().adverbs)
			}

		},

		/*
			Return content portions of the command
		*/
		getContentComponents : function (command) {

			var content_ids = this.content.map(function (obj) {
				return obj.id.toString();
			}); 

			var content_tags = [];
			for (var i = 0; i < this.content.length; i++) {
				for (var j = 0; j < this.content[i].tags.length; j++) {
					content_tags.push(this.content[i].tags[j]);
				}
			} 

			return {
				id 	: command.intersect(content_ids),
				tag : command.intersect(content_tags)
			}
		},

		/*
			Return language portions of the command
		*/
		getLanguageComponents : function (command) {
			var languages = [];
			var valid_languages = Utilities.STT.getLanguageData();
			for (language in valid_languages) {
				languages.push(language);
			}
			return command.intersect(languages);
		},

		parseCommand : function (command) {

			var splitCommand = command.split(' ').makeLower();

			/*
				Parse command for meaningful attributes
			*/
			var components = {
				actions : this.getLexicalComponents(splitCommand),
				content : this.getContentComponents(splitCommand),
				language : this.getLanguageComponents(splitCommand)
			};

			this.updateGUI(components);

			this.doAction(components.actions, this.getRequestedData(components));
		},

		/*
			Get matching data from request
		*/
		getRequestedData : function (args) {

			var content = null,
				language = null;

			/*
				Set content object
			*/
			if (args.content.tag.length > 0) {
				content = this.getContentByTags(args.content.tag);
			} else if (args.content.id.length > 0) {
				content = this.getContentById(args.content.id);
			} else {
				return 'Requested content not found.';
			}

			/*
				Set language object
			*/
			language = this.getLanguage(args.language[0]);

			return {
				content : content,
				language : language
			};

		},

		updateGUI : function (args) {
			$('#action').html(args.actions.verbs);
			$('#content').html(args.content);
			$('#language').html(args.language[0]);
		},

		doAction : function (action, args) {

			var self = this;

			console.log('do action', action, args);

			switch (action.verbs[0]) {
				case 'read':
					read();
					break;
				case 'open' :
					open();
					break;
				case 'close':
					close();
					break;
				default:
					error('Command not understood. You can request to Read, Open, or Close');

			};

			function open() {
				var $contentObject = $('.article').find('#'+args.content.id);
				self.checkState($contentObject);
				clearError();
			};

			function read() {
				var $contentObject = $('.article').find('#'+args.content.id);
				self.checkState($contentObject);
				Utilities.STT.native(args);
				clearError();
			};

			function close() {
				var $contentObject = $('.article').find('#'+args.content.id);
				$contentObject.removeClass('active');
				clearError();
			};

			function error(msg) {
				$('#error').html(msg);
			};

			function clearError() {
				$('#error').html('');
			};

		},

		checkState : function (obj) {
			$('.article').children().each(function () {
				if ($(this).attr('class') === 'active') {
					$(this).removeClass('active');
				}
			});
			obj.attr('class', 'active');
		}
	};

	Array.prototype.intersect = function(arr) {
		return this.filter(function(e) {
			return arr.indexOf(e) > -1;
		});
	};

	Array.prototype.makeLower = function() {
		return this.map(function (str) {
			return str.toLowerCase();
		});
	};

	Utilities.Manager.init();

});