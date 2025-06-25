# Gunakan node LTS
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package dan install dependensi
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]