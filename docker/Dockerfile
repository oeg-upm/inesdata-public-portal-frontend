# node base image
FROM node:20.11-alpine as builder

# working directory
WORKDIR /app

# copy everything to current working directory
COPY . ./

# run npm install
RUN npm install &&\
  npm run build

# nginx base image
FROM nginx:alpine

ENV NGINX_HOME=/usr/share/nginx
ENV DOCUMENT_ROOT=${NGINX_HOME}/html

# copy static contents of project to nginx html
COPY --from=builder /app/dist/angular-quickstart ${DOCUMENT_ROOT}

COPY ./docker/assets/scripts/docker-entrypoint.sh ${NGINX_HOME}

ENV ENVIRONMENT_CFG=${DOCUMENT_ROOT}/assets/config/app.config.json \
    ENVIRONMENT_CFG_TPL=${DOCUMENT_ROOT}/assets/config/app.config.template.json \
    ENVIRONMENT_CFG_TMP=/tmp/app.config.temp.json

# Copia fichero plantilla de configuracion de entorno y otorga permiso de escritura al mismo
COPY ./src/assets/config/app.config.template.json ${ENVIRONMENT_CFG_TPL}
COPY ./src/assets/config/app.config.template.json ${ENVIRONMENT_CFG}

ENV INDEX_FILE=${DOCUMENT_ROOT}/index.html \
    INDEX_FILE_TMP=/tmp/runtime-index-template-temp.html

# Se setean permisos
RUN chmod ug+w ${ENVIRONMENT_CFG} \
  && chmod ug+x ${NGINX_HOME}/docker-entrypoint.sh

## Nginx default configuration
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Script entrypoint del contenedor
ENTRYPOINT [ "sh", "-c", "${NGINX_HOME}/docker-entrypoint.sh"]
