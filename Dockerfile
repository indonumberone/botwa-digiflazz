FROM oven/bun:1-alpine

WORKDIR /app

COPY package*.json ./
COPY bun.lockb* ./

RUN bun install --production

COPY . .

RUN rm -rf /app/src/login &&  mkdir -p /app/src/login && chmod 777 /app/src/login

EXPOSE 3030

CMD ["bun", "run", "src/index.js"]
