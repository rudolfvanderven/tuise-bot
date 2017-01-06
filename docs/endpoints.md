# BOT API Endpoints

# GET /ping
Get server `pong` response
+ Response 200 (application/json)
    + Attributes (object)
        - message: pong (string)
    + Body

        ```json
        {"message": "pong"}
        ```

# GET /trigger
Trigger bot to speak one of the greetings
+ Response 200 (application/json)
    + Attributes (object)
        - message: bot response (string)
    + Body

        ```json
        {"message": "bot response"}
        ```

# GET /available-triggers
Get the triggers words that should trigger the bot greetings responses
+ Response 200 (application/json)
    + Attributes (object)
        - triggers:["word1", "word2", "word3"]  (array of strings)
    + Body

        ```json
        {"triggers": ["word1", "word2", "word3"]}
        ```

# GET /commands
Get the commands and commands configuration
+ Response 200 (application/json)
    + Attributes (object)
        - command: (object) the defined command
          - message: false (boolean) if the command needs more input
          - triggers: ["command-trigger-word1", "command-trigger-word2", "command-trigger-word3"]  (array of strings)
    + Body

        ```json
        {
          "command": {
            "message": false,
            "triggers": [
              "command-trigger-word1",
              "command-trigger-word2",
              "command-trigger-word3"
            ]
          }
        }
        ```

# POST /execute
Tell the bot to execute the command
+ Request (application/json)
    + Attributes (object)
        - command: command (string)
        - message: more user input (string)
    + Body

        ```json
      {
        "command": "question",
        "message": "Is it going to rain in Lisboa Portugal?"
      }
      ```
+ Response 200 (application/json)
    + Attributes (object)
        - message: command result (string)
    + Body

        ```json
        {"message": "command result"}
        ```

[<< back](./README.md)
