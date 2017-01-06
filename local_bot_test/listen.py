import speech_recognition
import pyvona
import sys
import ConfigParser

configParser = ConfigParser.RawConfigParser()
configFilePath = r'config.cfg'

configParser.read(configFilePath)

v = pyvona.create_voice(configParser.get('main', 'access_key'), configParser.get('main', 'secret_key'))
v.voice_name="Nicole"
v.language="en-AU"
v.gender="Female"

recognizer = speech_recognition.Recognizer()

def speak(text):
    v.speak(text)

def listen():
    with speech_recognition.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        #return recognizer.recognize_sphinx(audio)
        return recognizer.recognize_google(audio) 
        
    except speech_recognition.UnknownValueError:
        print("Could not understand audio")
        
    except speech_recognition.RequestError as e:
        print("Recognition error: {0}".format(e))

    return ""


print("Gonna listen to you now.")
while True:
    speak("Hello Master. How can I help you.")
    print("You may speak now.")
    st = listen()
    if not st:
        st = "something that I could not understand"
    result = "You said " + st.replace("*", "") + "."
    print(result)
    speak(result)
    if "shutdown" in result:
        break
