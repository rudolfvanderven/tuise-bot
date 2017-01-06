import os
import logging
import pyvona
import ConfigParser
import random
import json
import threading

from pyramid.config import Configurator
from pyramid.response import Response
from pyramid.exceptions import NotFound
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config

from wsgiref.simple_server import make_server

from commands.main_commands import process_command

# setup logging
logging.basicConfig(filename='dudebot.log', level=logging.DEBUG)
log = logging.getLogger(__file__)

# get configuration
configParser = ConfigParser.RawConfigParser()
configFilePath = r'config.cfg'
configParser.read(configFilePath)

access_key = configParser.get('main', 'access_key')
secret_key = configParser.get('main', 'secret_key')

# bot triggers default
triggers = ['hey dude']

# available commands
commands = { "question" : ['question', 'questions', 'pergunta', 'questao']}

# greetings default
greetings = ["Yes?"]

# setup pyvona voice
voice = pyvona.create_voice(access_key, secret_key)
voice.voice_name="Brian"
voice.language="en-GB"
voice.gender="Male"

# app setup
port = 8080

def load_bot_configuration():
    with open('bot_config.json') as json_data:
        bot_conf = json.load(json_data)

    return bot_conf


def speak(text):
    voice_cnf = load_bot_configuration()["voice"]
    voice.voice_name=voice_cnf["voice_name"]
    voice.language=voice_cnf["language"]
    voice.gender=voice_cnf["gender"]
    voice.speak(text)


def threadSpeak(text):
    threading.Thread(target=speak, args=(text,)).start()


# views
@view_config(
    route_name='ping',
    request_method=('GET'),
    renderer='json'
)
def ping(request):
    request.response.status = 200
    log.info(voice.list_voices())
    return {"message": "pong"}


@view_config(
    route_name='trigger',
    request_method=('GET'),
    renderer='json'
)
def listen(request):
    greetings = load_bot_configuration()["greetings"]
    greet = random.choice(greetings)
    log.info(greet)
    threadSpeak(greet)
    request.response.status = 200
    return {"message": greet}


@view_config(
    route_name='triggers',
    request_method=('GET'),
    renderer='json'
)
def get_triggers(request):
    triggers = load_bot_configuration()["triggers"]
    request.response.status = 200
    return {"triggers": triggers}


@view_config(
    route_name='commands',
    request_method=('GET'),
    renderer='json'
)
def get_commands(request):
    commands = load_bot_configuration()["commands"]
    request.response.status = 200
    return commands


@view_config(
    route_name='execute',
    request_method=('POST'),
    renderer='json'
)
def execute_command(request):
    data = request.json_body
    log.info(data)
    result = "Sorry but I cannot recognize the command."
    if data["command"]:
        if data["message"]:
            result = process_command(data["command"], data["message"])
        else:
            result = process_command(data["command"])

    if result != "":
        threadSpeak(result)

    request.response.status = 200
    return {"message": result}


@view_config(
    context='pyramid.exceptions.NotFound',
    renderer='json'
)
def notfound_view(request):
    request.response.status = '404 Not Found'
    return { "code" : 404, "message" : 'Not Found'}


if __name__ == '__main__':
    log.info("App listening at port %d" % port)
    # configurations settings
    settings = {}
    settings['reload_all'] = True
    settings['debug_all']  = True
    # configuration setup
    config = Configurator(settings=settings)
    # routes setup
    config.add_route('ping', '/ping')
    config.add_route('triggers', '/available-triggers')
    config.add_route('trigger', '/trigger')
    config.add_route('commands', '/commands')
    config.add_route('execute', '/execute')
    config.add_static_view('/', 'site', cache_max_age=3600)
    # scan for @view_config decorators
    config.scan()
    # serve app
    app = config.make_wsgi_app()
    server = make_server('0.0.0.0', port, app)
    server.serve_forever()
