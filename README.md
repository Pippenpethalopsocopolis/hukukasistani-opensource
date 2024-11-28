# What is Hukuk Asistanı?

Hukuk Asistanı is a SaaS that provides it's users legal information.

Thanks to advancements in the LLM, Hukuk Asistanı software can give people better, more trustable legal information than a regular lawyer because you can litteraly feed this AI with any data you have.
You have tons of books about law that best of the lawyers used in their careers, feed it to AI and it will give every answer regular lawyer can provide.

## How to use it?

In order to make this code work, use .env file, with these enviroment variables:

OPENAI_API_KEY=

DB_PASSWORD=

MAILGUN_API_KEY=

TWILIO_ACCOUNT_SID=

TWILIO_AUTH_TOKEN=

IYZIPAY_API_KEY=

IYZIPAY_SECRET_KEY=

You will need to have api keys of these services of course. You can alter these if you want to use other services for email sending, sms sensding or your choosing of LLM apis.

apijs folder contains backend codes which is backbone of this project. Main JavaScript file for this project is api.js. All backend code(routes, file serving, api logic etc) happens here.

## Licence
MIT
