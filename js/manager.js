
document.addEventListener("DOMContentLoaded", function(event) {

	Utilities = Utilities || {};

	Utilities.Manager = {

		init : function () {
			this.content = [];
			this.requested_content = null;
			this.translated_languages = ['en-us'];
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

		getContentByTags : function (tag) {
			for (var i = 0; i < this.content.length; i++) {
				for (var j = 0; j < this.content[i].tags.length; j++) {
					if (this.content[i].tags[j].toLowerCase() === tag) {
						return this.content[i];
					}
				}
			}
		},

		checkIsTranslated : function (lang) {
			return this.translated_languages.indexOf(lang) > -1;
		},

		/*
			Translate on the fly using Google Translate API (I'm a poet and I knew it)
		 */
		localize : function (lang, callback) {

			var self = this;
			var promises=[];

			for (var i = 0; i < this.content.length; i++) {

				/*
					 Translating from English -> Foreign Language for this version
					 Eventually will have functionality to translate From Any Language -> Any Language
				 */
				var text = this.content[i].content[0].text;

				var request =
					(function (i) {
						$.get('https://www.googleapis.com/language/translate/v2?key=AIzaSyCl7D63jOipGzu__0bwfyCNvQ8TTdUSI3o&source=en&target=' + lang + '&q=' + text,
							function (json) {
								self.content[i].content.push(
									{
										code: lang,
										text: json.data.translations[0].translatedText
									}
								);
								self.translated_languages.push(lang);
							}
						);
					})(i);
				promises.push(request);
			}

			$.when.apply(null, promises).done(function(){
				console.log('Done translating...');
				if (typeof callback === 'function') callback();
			}.bind(this));
		},

		setAllText : function (lang) {
			this.content.forEach(function (Article, index) {
				var result = $.grep(Article.content, function(e){
					return e.code === lang;
				});
				this.setTranslatedText(++index, result[0].text);
			}.bind(this));
		},

		setTranslatedText : function (id, text) {
			$('.article').find('#' + id).find('.text').html(text);
		},

		/*
			Return valid lexical portions of the command
		*/
		getLexicalComponents : function (command) {
			return {
				verbs 		 : command.intersect(Utilities.Lexicon.getLexicon().verbs),
				prepositions : command.intersect(Utilities.Lexicon.getLexicon().prepositions),
				adverbs	 	 : command.intersect(Utilities.Lexicon.getLexicon().adverbs)
			}
		},

		/*
			Return valid content portions of the command
		*/
		getContentComponents : function (command) {
			var content_ids = this.content.map(function (obj) {
				return obj.id.toString();
			}); 

			var content_tags = [];
			for (var i = 0; i < this.content.length; i++) {
				for (var j = 0; j < this.content[i].tags.length; j++) {
					content_tags.push(this.content[i].tags[j].toLowerCase());
				}
			} 

			return {
				id 	: command.intersect(content_ids),
				tag : command.intersect(content_tags)
			}
		},

		/*
			Return valid language portions of the command
		*/
		getLanguageComponents : function (command) {
			var languages = [],
			 	valid_languages = Utilities.STT.getLanguageData();

			valid_languages.forEach(function (obj, index) {
				languages.push(obj.lang.toLowerCase());
			});

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

			var requested_data = this.getRequestedData(components);

			/*
				If user requested narration language, translate first, then narrate
				But first check if that language has already been translated
			 */
			var self = this;
			if (requested_data.language) {
				if (!this.checkIsTranslated(requested_data.language.code)) {
					this.localize(requested_data.language.code, function () {
						/*
							 Awkward temp fix because callback is still returning before translated articles are available
						 */
						if (bandaid) clearTimeout(bandaid);
						var bandaid = setTimeout(function () {
							self.doAction(components.actions, requested_data);
							clearTimeout(bandaid);
						}, 500);

					});
				} else {
					this.doAction(components.actions, requested_data);
				}
			} else {
				this.doAction(components.actions, requested_data);
			}

			this.updateGUI(components.actions, requested_data);
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
				content = this.getContentByTags(args.content.tag[0]);
			} else if (args.content.id.length > 0) {
				content = this.getContentById(args.content.id);
			} else {
				return 'Requested content not found.';
			}

			language = $.grep(Utilities.STT.getLanguageData(), function (obj) {
				return obj.lang.toLowerCase() === args.language[0];
			});

			return {
				content : content,
				language : language[0]
			};

		},

		updateGUI : function (actions, args) {

			var	action = content = language = 'Parsing command...';

			if (actions) {
				action = actions.verbs;
			}	
			if (args.content) {
				content = args.content.title;
			}
			if (args.language) {
				language = args.language.lang;
			}

			$('#action').html(action);
			$('#content').html(content);
			$('#language').html(language);
		},

		doAction : function (action, args) {

			var self = this;

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
