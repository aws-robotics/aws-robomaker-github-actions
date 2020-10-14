 
FROM python:3.7-alpine

LABEL "com.github.actions.name"="git-secrets-scan-action"
LABEL "com.github.actions.description"="Scan for secrets in your repo CI"
LABEL "com.github.actions.icon"="trending-up"
LABEL "com.github.actions.color"="blue"

# Setup environment to install and run git-secrets
RUN apk update
RUN apk add bash 
RUN apk add --update alpine-sdk
RUN apk add --update git
RUN apk add --update ncurses

ADD entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]