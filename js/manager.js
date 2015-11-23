
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
				var content = json.data;
				for (var i = 0; i < content.length; i++) {
					self.content.push(new Article(content[i]));
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

		checkCommand : function (command) {

			var splitCommand = command.split(' ');

			/*
				Store lexical components of command
			*/
			var actions = this.getLexicalComponents(splitCommand);

			/*
				Store content components of command
			*/
			var content_components = this.getContentComponents(splitCommand);

			console.log('sadsd', content_components);


			// if (this.requested_content_ids.length > 0) {

			// 	this.requested_content = this.getContent(this.requested_content_ids[0]);

			// 	this.updateGUI(command, this.actions, this.requested_content);

			// 	console.log('REQ CONTENT', this.requested_content);

			// 	this.parseCommand(this.actions[0], this.requested_content);
			// }


		},

		updateGUI : function (command, actions, content) {
			$('#action').html(actions);
			$('#content').html(content.title);
		},

		parseCommand : function (command, object) {

			var self = this;

			switch (command) {
				case 'read':
					read();
					break;
				case 'open' :
					open();
					break;
				case 'close':
					close();
					break;
				case 'translate':
					translate();
					break;
				default:
					error('Command not understood. You can request to Read, Open, or Close');

			};

			function open() {
				var $contentObject = $('.article').find('#'+object.id);

				self.checkState($contentObject);
				// $('.article').find('#'+object[0]).attr('class', 'active');
				clearError();
			};

			function read() {

				var $contentObject = $('.article').find('#'+object.id);

				self.checkState($contentObject);

				Utilities.STT.native(object);

				clearError();
			};

			function close() {
				$('.article').find('#'+object.id).removeClass('active');

				clearError();
			};

			function translate() {

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

	Utilities.Manager.init();

});