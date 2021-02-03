
proxy_cache_path /var/cache/nginx/unpkg levels=1:2 keys_zone=unpkg:10m max_size=100m inactive=60m;
proxy_buffering on;

proxy_cache_valid 302  1d;
proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;


server {
  listen 80 default_server;
  server_name localhost;
  client_max_body_size 100M;
  access_log /dev/stdout;
  error_log /dev/stdout info;

  location @handle_redirect {
    # drop routing information from urls that do not start with `/dist/`
    rewrite ^/([^/]*)/([^/]*)/(?!dist/).*$ /$1/$2 last;

    proxy_intercept_errors on;
    error_page 301 302 307 = @handle_redirect;
    set $frontend_host 'https://unpkg.com';
    set $saved_redirect_location '$upstream_http_location';
    proxy_pass $frontend_host$saved_redirect_location;
    # Do not cache these redirects too long
    expires 10m;
  }

  location /@molgenis-experimental/ {
      proxy_cache unpkg;
      proxy_pass https://unpkg.com/@molgenis-experimental/;
      proxy_buffers 8 1024k;
      proxy_buffer_size 2k;
  }

  # Rewrite when using a remote molgenis; e.g. master.dev.molgenis.org
  location ~ ^/@molgenis-ui/molgenis-theme/dist/themes/mg-${MG_THEME}-(?<version>[0-9]+).(?<extension>[a-z]+.[a-z]+) {
      root /usr/share/nginx/html/;
      add_header Last-Modified $date_gmt;
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      rewrite ^ /dist/themes/mg-${MG_THEME}-$version.$extension break;
  }

  location /@molgenis-ui/ {
      proxy_cache unpkg;
      proxy_pass https://unpkg.com/@molgenis-ui/;
      proxy_intercept_errors on;
      recursive_error_pages on;
      error_page 301 302 307 = @handle_redirect;
  }

  # New molgenis-theme proxy endpoint must expose /themes/ and
  # /fonts. In this case locally, on production pointing to unpkg, e.g.
  # https://unpkg.com/browse/@molgenis-ui/molgenis-theme@latest/themes/
  # https://unpkg.com/browse/@molgenis-ui/molgenis-theme@latest/fonts/
  location ~ "^/(themes|fonts)" {
      autoindex on;
      root /usr/share/nginx/html/dist;
  }

  location / {
      proxy_pass ${MG_PROXY};
      proxy_buffers 8 24k;
      proxy_buffer_size 2k;
  }
}
