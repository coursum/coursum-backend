ARG NODE_VERSION

FROM node:${NODE_VERSION} AS builder

WORKDIR /workdir
COPY package.json yarn.lock ./
# Solve the problem of ENOENT: no such file or directory
# https://github.com/yarnpkg/yarn/issues/2629#issuecomment-283580308
RUN yarn install --network-concurrency 1
COPY . .
RUN yarn build

CMD ["yarn", "run", "start"]
