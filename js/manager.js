
document.addEventListener("DOMContentLoaded", function(event) {

	Utilities = Utilities || {};

	Utilities.Manager = {

		init : function () {
			this.content = [];
			this.actions = null;
			this.prepositions = null;
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

			var content = [
				{
					id : 1,
					title : 'Speech APIs',
					date : '11/12/2015',
					text : 'I love using web speech APIs to make websites more dynamic.',
					text_es: 'Me encanta usar las API de voz web para hacer sitios web más dinámica',
					text_cn: '我喜欢使用网络语音的API，使网站更具活力',
					tags : ['Speech', 'APIs'],
					image :  'http://placehold.it/500x500'
				},
				{
					id : 2,
					title : 'Fuzz Productions',
					date : '11/15/2015',
					text : 'Fuzz Productions is pretty solid overall. Interesting that it was founded in 1997 actually.',
					text_es: 'Fuzz Productions es bastante sólido en general. Interesante que fue fundada en 1997 en realidad.',
					text_cn: '绒毛制作是相当牢固的整体。有趣的是，它成立于1997年实际。',
					tags : ['Fuzz', 'Productions', 'Mobile', 'Apps'],
					image :  'http://placehold.it/500x500'
				},
				{
					id : 3,
					title : 'Nodevember',
					date : '11/22/2015',
					text : 'Nodevember was an interesting conference to say the least.',
					text_es: 'Nodevember era una conferencia interesante para decir lo menos.',
					text_cn: 'Nodevember是一个有趣的会议，至少可以说。',
					tags : ['Nodevember', 'Conference', 'Nashville'],
					image :  'http://placehold.it/500x500'
				},
				{
					id : 4,
					title : 'Nicknaming Today',
					date : '12/12/2015',
					text : 'The nickname "turtle" is egregiously offensive. No one should have to deal with that.',
					text_es: 'La "tortuga" apodo es notoriamente ofensiva. Nadie debería tener que lidiar con eso.',
					text_cn: '绰号"龟"是异乎寻常的进攻。任何人都不应该有面对这一切。',
					tags : ['Nicknames', 'Names', 'Bullying'],
					image :  'http://placehold.it/500x500'
				}
			];


			for (var i = 0; i < content.length; i++) {

				var article = new Article(content[i]);

				this.content.push(article);
			}
		},

		getContent : function (id) {

			for (var i = 0; i < this.content.length; i++) {
				if (this.content[i].id === +id) {
					return this.content[i];
				}
			}
		},

		checkCommand : function (command) {

			var splitCommand = command.split(' ');

			console.log('split', splitCommand);

			this.actions = splitCommand.intersect(Utilities.Lexicon.getLexicon().verbs);

			this.prepositions = splitCommand.intersect(Utilities.Lexicon.getLexicon().prepositions);


			console.log('ACTIONS', this.actions);
			console.log('PREPOSITIONS', this.prepositions);

			console.log('CONTENT', this.content);
			var content_ids = this.content.map(function (obj) {
				return obj.id;
			});

			var content_tags = this.content.map(function (obj) {
				return obj.tags;
			});

			console.log('CONTENT TAGS', content_tags);

			this.requested_content_tags = splitCommand.intersect(content_tags);

			console.log('REQUEST TAGS', this.requested_content_tags);


			/*
				Get requested IDs from command, check for matches in current array of Content
			*/	
			this.requested_content_ids = splitCommand.intersect(content_ids);

			if (this.requested_content_ids.length > 0) {

				this.requested_content = this.getContent(this.requested_content_ids[0]);

				this.updateGUI(command, this.actions, this.requested_content);

				console.log('REQ CONTENT', this.requested_content);

				this.parseCommand(this.actions[0], this.requested_content);
			}


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