ARG NODE_VERSION=12.10.0
FROM node:${NODE_VERSION}-stretch-slim

ARG CLOUDINARY_CLOUD_NAME
ARG CLOUDINARY_KEY
ARG CLOUDINARY_SECRET
ARG DF_BUILD_REV
ARG GOOGLE_MAPS_KEY
ARG MONGO_URI
ARG REDIS_HOST
ARG REDIS_PASSWORD
ARG REDIS_PORT
ARG TINI_VERSION=v0.18.0

ENV DF_BUILD_REV=$DF_BUILD_REV
ENV PORT 80
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
ENTRYPOINT ["/tini", "--"]

ADD . /app
WORKDIR /app
RUN export \
    CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME \
    CLOUDINARY_KEY=$CLOUDINARY_KEY \
    CLOUDINARY_SECRET=$CLOUDINARY_SECRET \
    GOOGLE_MAPS_KEY=$GOOGLE_MAPS_KEY \
    MONGO_URI=$MONGO_URI \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PASSWORD=$REDIS_PASSWORD \
    REDIS_PORT=$REDIS_PORT \
    && \
    chmod a+x /tini && \
    yarn && \
    NO_CLEAN=1 yarn build && \
    yarn cache clean

CMD ["yarn", "start"]
