FROM nginx
RUN rm /usr/share/nginx/html/*.html
COPY docker/preview/default.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html/@molgenis-ui/molgenis-theme/dist/