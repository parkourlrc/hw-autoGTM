FROM node:24-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=7860
EXPOSE 7860
CMD ["npm", "start"]
