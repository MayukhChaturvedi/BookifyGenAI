FROM node:lts-alpine

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]