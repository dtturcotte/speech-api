
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
				narrating = false,
				valid_languages = [
					{
						code : 'en-us',
						lang : 'English'
					},
					{
						code : 'es',
						lang : 'Spanish'
					},
					{
						code : 'zh-cn',
						lang : 'Chinese'
					},
					{
						code : 'fr',
						lang : 'French'
					},
					{
						code : 'zu',
						lang : 'Zulu'
					}
				];

			api.init = function () {
				/*
					Bind click handlers
				 */
				speech_toggle.addEventListener("click", this.speak.bind(this), false);

				speech_toggle.innerHTML = "Speak in ";

				setValidLanguages();

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

			function setValidLanguages () {
				valid_languages.forEach(function (obj, index) {
					$('<option>').val(obj.code).text(obj.lang).appendTo('#select_speech');
				});
			}

			api.controls = function (e) {
				speech_rate = $('#select_language').val();
				recognition_lang = $('#select_speech').val();

				console.log('recog', recognition_lang);

				if (!Utilities.Manager.checkIsTranslated(recognition_lang))  {
					Utilities.Manager.localize(recognition_lang, function () {
						/*
							Awkward temp fix because callback is still returning before translated articles are available
						 */
						if (bandaid) clearTimeout(bandaid);
						var bandaid = setTimeout(function () {
							Utilities.Manager.setAllText(recognition_lang);
							clearTimeout(bandaid);
						}, 500);
					});
				} else {
					Utilities.Manager.setAllText(recognition_lang);
				}
			};

			api.getLanguageData = function () {
				return valid_languages;
			},

			api.native = function (object, e) {
				/*
					Cancel out current speech object or audio will not play
				 */

				console.log('NATIVE', object);
				speechSynthesis.cancel();

				var utterance = new SpeechSynthesisUtterance();

				utterance.rate = speech_rate;

				var lang = (object.language) ? object.language.code : 'en-us';

				console.log('LANG', lang);

				switch (lang) {
					case 'es':
						lang = 'es-CO';
						break;
					case 'zh-cn':
						lang = 'zh-CN';
						break;
					case 'fr':
						lang = 'fr-FR';
						break;
					case 'zu':
						lang = 'zu';
						break;
					default:
						lang = 'en-IN';
						break;
				}

				console.log('LANG2', lang);

				utterance.lang = lang;
				utterance.text = object.content.content[0].text;

				utterance.onend = function (e) {
					console.log('Finished in ' + e.elapsedTime + ' seconds.');
					narrating = false;
				};

				speechSynthesis.speak(utterance);

			};

			api.start_recognition = function (e) {

				recognition.continuous = true;
				//recognition.interimResults = true;
				recognition.lang = recognition_lang;

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

