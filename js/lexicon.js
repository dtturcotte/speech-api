
document.addEventListener("DOMContentLoaded", function(event) {

	Utilities = Utilities || {};
	 
	Utilities.Lexicon = Utilities.Lexicon || {

		init : function () {

			this.verbs = [
				'read',
				'open',
				'close'
			];

			this.prepositions = [
				'of',
				'in',
				'by',
				'about',
				'into'
			];

			this.adverbs = [
				'then'
			]
		},

		getLexicon : function () {
			return this;
		}

	};

	Utilities.Lexicon.init();

});