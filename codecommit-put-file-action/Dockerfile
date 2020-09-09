 
FROM python:3.7-alpine

LABEL "com.github.actions.name"="codecommit-put-file-action"
LABEL "com.github.actions.description"="Put file in a codecommit repository"
LABEL "com.github.actions.icon"="trending-up"
LABEL "com.github.actions.color"="green"

LABEL version="1.0.0"

ENV AWSCLI_VERSION='1.16.232'

RUN pip install --quiet --no-cache-dir awscli==${AWSCLI_VERSION}

ADD entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]