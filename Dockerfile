FROM node:24-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
