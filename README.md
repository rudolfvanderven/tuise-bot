# Dude-Bot

## Installation

Make sure you have recording and python installed

    $ sudo apt-get install libav-tools portaudio19-dev python-setuptools easy_install pip

Install [pyvona](https://github.com/zbears/pyvona) and its dependencies

    $ sudo pip install pyvona requests pygame

Install virtualenv

    $ sudo apt-get install python-virtualenv


**\[optional\](see Usage)**

Download and Install [wolframAlpha python library](https://github.com/jaraco/wolframalpha)

    $ sudo python setup.py build

    $ sudo python setup.py

<hr>

## Usage

Create a virtual environment and install wolframalpha (if you didn't before) and pyramid.

    $ mkdir venv
    $ export VENV=path-to-your-dir/venv
    $ virtualenv --system-site-packages $VENV
    $ . $VENV/bin/activate
    $ $VENV/bin/pip install wolframalpha
    $ $VENV/bin/pip install "pyramid==1.7.3"


Get an [WolframAlpha API](http://products.wolframalpha.com/api/) APP-ID

Get an [IVONA Speech Cloud Account](https://www.ivona.com/us/for-business/speech-cloud/) and generate credentials: Access and Secret Key


Create configuration file `config.cfg` at project root

```
[main]
app_id = YOUR-APIKEYHERE
access_key = IVONA_ACCESS_KEY
secret_key = IVONA_SECRET_KEY
```

Edit the bot configuration file `bot_config.json` at project root

```
{
	"triggers": ['dude', 'hey dude', 'hey mate', 'ok dude', 'okay dude'],
	"greetings": ["Sire?", "One is glad to be of service!", "How can I help?", "What is it!?! Can't you see I'm busy?", "WHAT???"],
	"voice": {"voice_name": "Brian", "language": "en-GB", "gender": "Male"}
}
```

- **triggers**: the triggers that "wake" the bot (words you say so that the bot know you want to execute a command)
- **grettings**: the bot responses to being woken
- **voice**: the voice configuration from ivona

## Note
Before running check your pyOpenSSL version. It needs to be **>= 0.14**.

Run this to check the version:

    $  python -c 'import OpenSSL; print(OpenSSL.__version__)'

Run this to update it:    

    $ sudo pip install -U pyOpenSSL

## Run

    $ $VENV/bin/python api_dudebot.py

The app will start listening on port: `8080`.
Open the browser into `localhost:8080` and you should see the bot.

## Add New Commands
In order to add new commands go into the `commands` folder and create the following structure:
```
commands/
 └─── new_command/
      |- __init__.py
      │- new_command.py
```
- Create a new folder with the command name for simplicity
- Add an empty `__init__.py` file
- Add a new python file with the command name (again for simplicity reasons) where you'll add your code
- Inside main_commands.py import the functionality created and edit the function `process_command` in order to call your functionality
- Add the command to the bot configuration file in `bot_config.json`. Format:
```
"command": {
  "triggers": [
    "words",
    "that",
    "will",
    "trigger",
    "this",
    "command"
  ],
  "message": true or false
}
```
  - **triggers:** the words that will trigger the command
  - **message:** if the the command expects more input other than the trigger set this to `true` if not set it to `false`

- Check the `ping` command for an simple example

## Docs
[docs](./docs)

## Resources

- [Raspberry Pi Voice Recognition Works Like Siri](https://oscarliang.com/raspberry-pi-voice-recognition-works-like-siri/)
- [Pyvona - A python wrapper for Amazon's IVONA API](http://zacharybears.com/pyvona/)
- [BEST VOICE RECOGNITION SOFTWARE FOR RASPBERRY PI](http://diyhacking.com/best-voice-recognition-software-for-raspberry-pi/)
