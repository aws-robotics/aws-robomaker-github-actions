 
FROM python:3.7-alpine

LABEL "com.github.actions.name"="codecommit-put-file-action"
LABEL "com.github.actions.description"="Put file in a codecommit repository"
LABEL "com.github.actions.icon"="trending-up"
LABEL "com.github.actions.color"="green"

ENV AWSCLI_VERSION='1.16.232'

RUN pip install --quiet --no-cache-dir awscli==${AWSCLI_VERSION}

RUN apk add --no-cache ca-certificates jq

ADD entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]