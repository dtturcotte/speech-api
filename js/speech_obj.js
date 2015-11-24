
document.addEventListener("DOMContentLoaded", function(event) {

	(function () {

		Utilities.STT = Utilities.STT || {};

		Utilities.STT = (function () {

			var api = {},
				recognition = new webkitSpeechRecognition(),
				speaking = false,
				speech_toggle = document.getElementById('toggle_speech'),
				pronunciation_speed_slider = document.getElementById('pronunciation_speed_slider'),
				speech_rate = 1,
				recognition_lang = 'en-us';
				command = '',
				narrating = false;

			api.init = function () {
				/*
					Bind click handlers
				 */
				speech_toggle.addEventListener("click", this.speak.bind(this), false);

				speech_toggle.innerHTML = "Speak in ";

				this.controls();
			};

			api.speak = function (e) {
				if (speaking) {
					speaking = false;
					this.stop_recognition(e);
					speech_toggle.innerHTML = "Speak in ";


				} else {
					speaking = true;
					this.start_recognition(e);
					speech_toggle.innerHTML = "Stop Speaking in ";
				}
			};

			api.controls = function (e) {
				speech_rate = $('#select_language').val();
				recognition_lang = this.getLanguageData()[$('#select_speech').val()];
			};

			api.getLanguageData = function () {
				return {
					'spanish' : {
						lang : 'Spanish',
						code : 'es-ar',
						text : 'es'
					},
					'chinese' : {
						lang : 'Chinese',
						code : 'zh-cn',
						text : 'cn'
					},
					'english' : {
						lang : 'English',
						code : 'en-us',
						text : 'en'
					},
					'taiwanese' : {
						lang : 'Taiwanese',
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

				utterance.rate = speech_rate;

				var text = null,
					lang = null;

				if (object.language) {
					lang = object.language.code || 'en-us';
					text = object.language.text || 'en';
				} else {
					lang = 'en-us';
					text = 'en';
				}

				utterance.lang = lang;
				utterance.text = object.content.text[text];

				utterance.onend = function (e) {
					console.log('Finished in ' + e.elapsedTime + ' seconds.');
					narrating = false;
				};

				speechSynthesis.speak(utterance);

			};

			api.start_recognition = function (e) {

				recognition.continuous = true;
				recognition.interimResults = true;

				/*
					Spanish and English tests
				 */
				//recognition.lang = "es-AR";
				//recognition.lang = "en-US";
				//recognition.lang = "cmn-Hans-CN";
				recognition.lang = recognition_lang.code;

				recognition.onstart = function (event) {
					console.log(event);
					console.log('spoken');
				};

				recognition.onpause = function (event) {
					console.log('spoken');
				};

				recognition.onend = function (event) {
					speech_toggle.innerHTML = "Speak in ";
				};

				recognition.onerror = function (event) {
					console.error(event);
				};

				recognition.onresult = function (event) {
					var interim = '';

					var final = '';
					var interim = '';
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

