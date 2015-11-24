
document.addEventListener("DOMContentLoaded", function(event) {

	(function () {

		Utilities.STT = Utilities.STT || {};

		Utilities.STT = (function () {

			var api = {},
				recognition = new webkitSpeechRecognition(),
				words = [],
				speaking = false,
				speech_toggle = document.getElementById('toggle_speech'),
				native_speech = document.getElementById('native_speech'),
				pronunciation_speed_slider = document.getElementById('pronunciation_speed_slider'),
				speech_rate = 1,
				command = '',
				narrating = false;

			api.init = function () {
				/*
					Bind click handlers
				 */
				speech_toggle.addEventListener("click", this.speak.bind(this), false);
				native_speech.addEventListener("click", this.native.bind(this), false);


				speech_toggle.innerHTML = "Speak";
				native_speech.innerHTML = "Native";

				this.controls();
			};

			api.setWords = function (scrambled_wordBank_words) {
				words = scrambled_wordBank_words;
			};

			api.speak = function (e) {
				if (speaking) {
					speaking = false;
					this.stop_recognition(e);
					speech_toggle.innerHTML = "Speak";


				} else {
					speaking = true;
					this.start_recognition(e);
					speech_toggle.innerHTML = "Stop Speaking";
				}
			};

			api.controls = function (e) {

				speech_rate = $('#select_language').val();

			};


			api.options = function (e) {

			};

			api.getLanguageData = function () {
				console.log('getLanguageData');

				return {

					'spanish' : {
						code : 'es-ar',
						text : 'es'
					},
					'chinese' : {
						code : 'zh-cn',
						text : 'cn'
					},
					'english' : {
						code : 'en-us',
						text : 'en'
					},
					'taiwanese' : {
						code : 'zh-TW',
						text : 'cn'
					}
				}
			};

			api.native = function (object, e) {
				/*
					Cancel out current speech object or audio will not play
				 */
				speechSynthesis.cancel();

				var utterance = new SpeechSynthesisUtterance();

				//var voices = window.speechSynthesis.getVoices();
				//utterance.voice = voices.filter(function(voice) { return voice.name == 'Google 中国的'; })[0];

				utterance.rate = speech_rate;

				utterance.lang = object.language.code || 'en-us';

				var text = object.language.text || 'en';
				utterance.text = object.content.text[text];

				utterance.onend = function (e) {
					console.log('Finished in ' + e.elapsedTime + ' seconds.');
					narrating = false;
				};

				speechSynthesis.speak(utterance);

			};

			var reset = function () {

			};

			api.start_recognition = function (e) {

				var text = "";

				recognition.continuous = true;
				// recognition.lang = "cmn-Hans-CN";

				recognition.lang = 'en-us';

				recognition.interimResults = true;

				reset();

				/*
					Spanish and English tests
				 */
				//recognition.lang = "es-AR";
				//recognition.lang = "en-US";

				recognition.onstart = function (event) {
					console.log(event);
					console.log('spoken');
				};

				recognition.onpause = function (event) {
					console.log('spoken');
				};

				recognition.onend = function (event) {
					speech_toggle.innerHTML = "Speak";
				};

				recognition.onerror = function (event) {
					console.error(event);
				};

				recognition.onresult = function (event) {
					var interim = '';

					var final = "";
					var interim = "";
					for (var i = 0; i < event.results.length; ++i) {
						if (event.results[i].final) {
							final += event.results[i][0].transcript;
						} else {
							interim += event.results[i][0].transcript;
						}
					}

					update_response_box(interim);

				};

				recognition.start();
			};

			api.stop_recognition = function (event) {
				recognition.stop();
			};

			api.setCommand = function (val) {
				command = val;
			};

			api.getCommand = function () {
				return command; 
			};

			var update_response_box = function (text) {
				$('#textBox').html('');
				$('#textBox').html($('#textBox').html() + ' ' + text);

				api.setCommand(text);

				Utilities.Manager.parseCommand(api.getCommand());				
			};



			return api;

		})();
	})();

	(function () {
		Utilities.STT.init();
	})();
});

