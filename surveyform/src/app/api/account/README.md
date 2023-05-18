## Magic passwordless login

Works mostly the same as email/password workflow.
- We send an email with a temporary token
- When clicking the link, we redirect to a page in the app, that triggers the verification request via a fetch call

The magic link includes a redirection "from" parameter.
We provide the anonymousId to the verify function, so that we can link an user with email to multiple anonymous users if needed.

## Anonymous

We generate a fake userId "anonymous-1234", stored as a cookie.
Server-side, we detect this case, and instead of fetching the user from the database,
we generate a temporary, non-stored user.
This way we can generate a token as usual.