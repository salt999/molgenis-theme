
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
      proxy_cache unpkg;
      # drop routing information from urls that do not start with `/dist/`
      proxy_cache_use_stale timeout;
      rewrite ^/([^/]*)/([^/]*)/(?!dist/).*$ /$1/$2 last;
      error_page 301 302 307 = @handle_redirect;
      set $frontend_host 'https://unpkg.com';
      set $saved_redirect_location '$upstream_http_location';
      proxy_pass $frontend_host$saved_redirect_location;
  }

  #
  # Pre-Theme refactor uses different endpoints. Keep these around
  # until https://github.com/molgenis/molgenis/pull/9110/ is merged
  # and released.

  # HACK: Override a legacy hardcoded Bootstrap 3 theme with our own (login)
  location /css/bootstrap.min.css {
      add_header Last-Modified $date_gmt;
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      root /usr/share/nginx/html/;
      rewrite ^ /css/mg-${MG_THEME_LOCAL}-3.css break;
  }

  location /css/bootstrap-3/${MG_THEME_PROXY} {
      add_header Last-Modified $date_gmt;
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      root /usr/share/nginx/html/;
      rewrite ^ /css/mg-${MG_THEME_LOCAL}-3.css break;
  }

  location /css/bootstrap-4/${MG_THEME_PROXY} {
      add_header Last-Modified $date_gmt;
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      root /usr/share/nginx/html/;
      rewrite ^ /css/mg-${MG_THEME_LOCAL}-4.css break;
  }

  location /css/bootstrap-3/mg-${MG_THEME_LOCAL}-3.css.map {
    add_header Last-Modified $date_gmt;
    add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    root /usr/share/nginx/html/;
    rewrite ^ /css/mg-${MG_THEME_LOCAL}-3.css.map break;
  }

  location /css/bootstrap-4/mg-${MG_THEME_LOCAL}-4.css.map {
    add_header Last-Modified $date_gmt;
    add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    root /usr/share/nginx/html/;
    rewrite ^ /css/mg-${MG_THEME_LOCAL}-4.css.map break;
  }

  # HACK: Override a hardcoded theme from de2
  location /@molgenis-ui/data-explorer/dist/bootstrap-molgenis-blue.min.css {
      add_header Last-Modified $date_gmt;
      add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
      root /usr/share/nginx/html/;
      rewrite ^ /css/mg-${MG_THEME_LOCAL}-4.css break;
  }
  # End of Pre-Theme refactor endpoints...


  location /@molgenis-experimental/ {
      proxy_cache unpkg;
      proxy_pass https://unpkg.com/@molgenis-experimental/;
      proxy_buffers 8 1024k;
      proxy_buffer_size 2k;
  }

  location /@molgenis-ui/ {
      proxy_cache unpkg;
      proxy_pass https://unpkg.com/@molgenis-ui/;
      proxy_buffers 8 1024k;
      proxy_buffer_size 2k;
  }

  # New molgenis-theme proxy endpoint must expose /themes/ and
  # /fonts. In this case locally, on production pointing to unpkg, e.g.
  # https://unpkg.com/browse/@molgenis/molgenis-theme@latest/themes/
  # https://unpkg.com/browse/@molgenis/molgenis-theme@latest/fonts/
  location ~ /themes|fonts {
      autoindex on;
      root /usr/share/nginx/html/build;
  }

  location / {
      proxy_pass ${MG_PROXY};
      proxy_buffers 8 24k;
      proxy_buffer_size 2k;
  }
}
