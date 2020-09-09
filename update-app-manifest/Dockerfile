 
FROM python:3.7-alpine

LABEL "com.github.actions.name"="update-app-manifest"
LABEL "com.github.actions.description"="Update the app-manifest version tag"
LABEL "com.github.actions.icon"="copy"
LABEL "com.github.actions.color"="green"

LABEL version="1.0.0"

ENV AWSCLI_VERSION='1.16.232'

RUN pip install --quiet --no-cache-dir awscli==${AWSCLI_VERSION}

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]