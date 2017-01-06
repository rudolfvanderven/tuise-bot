from ping.ping import pong
from question.question import Question as Q
question = Q()

def process_command(command, message=""):
    """Returns the result of executing the command, usually a string for the to say.
    Return an empty string if you don't wish the bot to speak.

    Keyword arguments:
    command -- the command received
    message -- the message received, empty by default
    """

    result = "Sorry but that command is not part of my functions."

    if command == "ping":
        result = pong()
    elif command == "question":
        result = question.get_question_result(message)

    return result
