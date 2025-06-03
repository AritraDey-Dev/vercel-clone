FROM ubuntu:focal as build-server

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

RUN apt-get install git -y

WORKDIR /home/app
COPY . .
RUN bun run build

FROM ubuntu:local
COPY --from=build-server /home/app/dist /home/app/dist
COPY --from=build-server /home/app/node_modules /home/app/node_modules
COPY --from=build-server /home/app/package.json /home/app/package.json
COPY --from=build-server /home/app/main.sh /home/app/main.sh
RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
RUN apt-get install -y git


ENTRYPOINT [ "/home/app/main.sh" ]