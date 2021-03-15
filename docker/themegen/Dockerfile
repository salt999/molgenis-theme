FROM node:15
EXPOSE 3030

# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn

# Run your program under Tini
ENTRYPOINT ["/tini", "--"]
CMD ["yarn", "service"]